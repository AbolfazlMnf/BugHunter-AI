import { Module } from '@nestjs/common';
import { ProjectsController } from './controller/projects.controller';
import { ProjectsService } from './services/projects.service';
import { FileLanguageService } from './services/file-language.service';
import { FileTypeService } from './services/file-type.service';
import { ChunkFileService } from './services/chunk-file.service';
import { EmbeddingFileService } from './services/embedding-file.service';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    FileLanguageService,
    FileTypeService,
    ChunkFileService,
    EmbeddingFileService,
  ],
})
export class ProjectsModule {}
