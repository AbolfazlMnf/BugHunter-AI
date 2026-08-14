import { Module } from '@nestjs/common';
import { ProjectsController } from './controller/projects.controller';
import { ProjectsService } from './services/projects.service';
import { FileLanguageService } from './services/file-language.service';
import { FileTypeService } from './services/file-type.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, FileLanguageService, FileTypeService],
})
export class ProjectsModule {}
