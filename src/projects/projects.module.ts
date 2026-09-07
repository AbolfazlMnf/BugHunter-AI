import { Module } from '@nestjs/common';
import { ProjectsController } from './controller/projects.controller';
import { ProjectsService } from './services/projects.service';
import { FileLanguageService } from './services/file-language.service';
import { FileTypeService } from './services/file-type.service';
import { ChunkFileService } from './services/chunk-file.service';
import { EmbeddingFileService } from './services/embedding-file.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { QdrantService } from 'src/vector/qdrant.service';
import { CodeBase, CodeBaseSchema } from './schemas/code-base.schema';
import { RetrievalService } from './services/retrieval.service';
import { BullModule } from '@nestjs/bullmq';
import { projectProcessor } from './processors/project.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
      },
      {
        name: CodeBase.name,
        schema: CodeBaseSchema,
      },
    ]),
    BullModule.registerQueue({
      name: `project-processing`,
    }),
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    FileLanguageService,
    FileTypeService,
    ChunkFileService,
    EmbeddingFileService,
    QdrantService,
    RetrievalService,
    projectProcessor,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
