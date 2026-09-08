/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  async process(job: Job): Promise<void> {
    switch (job.name) {
      case `process-zip-file`: {
        const jobData = job.data as IProcessZipFileJobData;
        const { projectId, userId, filePath } = jobData;

        await this.projectService.updateProjectProcessingStatus(
          projectId,
          ProjectProcessingStatus.Processing,
        );

        try {
          console.log(`zip file processing started`);
          const buffer = await readFile(filePath);
          const file = {
            buffer,
            originalname: basename(filePath) ?? `project.zip`,
          } as Express.Multer.File;

          //extract zip file
          const files = await this.projectService.extractZip(file);
          //chunking files
          const chunks = this.chunkFileService.chunkFiles(files);
          console.log('Chunks:', chunks.length, chunks);
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
          // edit projectCodeBase
          await this.projectService.addCodeBaseToProject(projectId, file);
          // add to vector database
          await this.qdrantService.upsertEmbeddedChunks(embeddedChunks);

          // update processing status
          await this.projectService.updateProjectProcessingStatus(
            projectId,
            ProjectProcessingStatus.Completed,
          );
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
      }
    }
  }
}
