/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InternalServerErrorException } from '@nestjs/common';
import { Job } from 'bullmq';
import { readFile } from 'fs/promises';
import { ChunkFileService } from '../services/chunk-file.service';
import { ProjectsService } from '../services/projects.service';
import { IProcessZipFileJobData } from '../types/project-file.type';
import { basename } from 'path';
import { EmbeddingFileService } from '../services/embedding-file.service';
import { QdrantService } from 'src/vector/qdrant.service';

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
        try {
          const jobData = job.data as IProcessZipFileJobData;
          const { projectId, userId, filePath } = jobData;
          console.log(`zip file processing started`);
          const buffer = await readFile(filePath);
          const file = {
            buffer,
            originalname: basename(filePath) ?? `project.zip`,
          } as Express.Multer.File;

          const files = await this.projectService.extractZip(file);
          const chunks = this.chunkFileService.chunkFiles(files);
          console.log('Chunks:', chunks.length, chunks);
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
          await this.projectService.addCodeBaseToProject(projectId, file);
          await this.qdrantService.upsertEmbeddedChunks(embeddedChunks);
        } catch (err) {
          console.log(err);
          throw err;
        }
      }
    }
  }
}
