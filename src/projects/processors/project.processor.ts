import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { readFile } from 'fs/promises';
import { ChunkFileService } from '../services/chunk-file.service';
import { ProjectsService } from '../services/projects.service';
import {
  IProcessZipFileJobData,
  ProjectProcessingStatus,
} from '../types/project-file.type';
import { basename } from 'path';
import { EmbeddingFileService } from '../services/embedding-file.service';
import { QdrantService } from 'src/vector/qdrant.service';
import { deleteFile } from 'src/shared/utils/delete-file';

@Processor(`project-processing`)
export class projectProcessor extends WorkerHost {
  constructor(
    private readonly chunkFileService: ChunkFileService,
    private readonly projectService: ProjectsService,
    private readonly embeddingFileService: EmbeddingFileService,
    private readonly qdrantService: QdrantService,
  ) {
    super();
  }
  async process(job: Job<IProcessZipFileJobData>): Promise<void> {
    switch (job.name) {
      case `process-zip-file`: {
        const { projectId, userId, filePath } = job.data;

        try {
          console.log(`zip file processing started`);
          await this.projectService.updateProjectProcessingStatus(
            projectId,
            ProjectProcessingStatus.Processing,
          );

          const buffer = await readFile(filePath);
          const file = {
            buffer,
            originalname: basename(filePath),
          } as Express.Multer.File;

          //extract zip file
          const files = await this.projectService.extractZip(file);
          await job.updateProgress(10);
          await this.projectService.updateProcessingProgress(projectId, 10);

          //chunking files
          const chunks = this.chunkFileService.chunkFiles(files);
          console.log('Chunks:', chunks.length, chunks);
          await job.updateProgress(30);
          await this.projectService.updateProcessingProgress(projectId, 30);

          // embedding chunkedFiles
          const embeddedChunks = await this.embeddingFileService.embeddingFiles(
            chunks,
            projectId,
            userId,
          );
          console.log(
            'Embedded chunks:',
            embeddedChunks.length,
            embeddedChunks,
          );
          await job.updateProgress(60);
          await this.projectService.updateProcessingProgress(projectId, 60);

          // edit projectCodeBase
          await this.projectService.addCodeBaseToProject(projectId, file);
          await job.updateProgress(70);
          await this.projectService.updateProcessingProgress(projectId, 70);

          // add to vector database
          await this.qdrantService.upsertEmbeddedChunks(embeddedChunks);
          await job.updateProgress(90);
          await this.projectService.updateProcessingProgress(projectId, 90);

          // update processing status
          await this.projectService.updateProjectProcessingStatus(
            projectId,
            ProjectProcessingStatus.Completed,
          );
          await job.updateProgress(100);
          await this.projectService.updateProcessingProgress(projectId, 100);

          // delete zip file
          await deleteFile(filePath);
        } catch (err) {
          console.log(err);
          const isLastAttempt =
            job.attemptsMade + 1 >= (job?.opts?.attempts ?? 1);
          if (isLastAttempt) {
            await this.projectService.updateProjectProcessingStatus(
              projectId,
              ProjectProcessingStatus.Failed,
            );
            await deleteFile(filePath);
          }
          throw err;
        }
        break;
      }
    }
  }
}
