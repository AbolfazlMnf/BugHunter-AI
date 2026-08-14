import { BadRequestException, Injectable } from '@nestjs/common';
import * as unzipper from 'unzipper';
import { IProjectFile } from '../types/project-file.type';
import { ALLOWED_FILE_EXTENSIONS } from '../constants/project-files.constants';
import { FileTypeService } from './file-type.service';
import { FileLanguageService } from './file-language.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly fileTypeService: FileTypeService,
    private readonly fileLanguageService: FileLanguageService,
  ) {}
  private readonly ignoredDirectories = [
    'node_modules/',
    '.git/',
    'dist/',
    '.next/',
    'coverage/',
  ];
  async extractZip(file: Express.Multer.File): Promise<IProjectFile[]> {
    const directory = await unzipper.Open.buffer(file.buffer);
    const projectFiles: IProjectFile[] = [];

    for (const entry of directory.files) {
      const normalizedPath = entry.path.replace(/\\/g, '/');

      if (entry.type === 'Directory') {
        continue;
      }
      if (this.isIgnoredDirectory(normalizedPath)) {
        continue;
      }
      if (this.isUnSafePath(normalizedPath)) {
        throw new BadRequestException(
          `Unsafe path detected: ${normalizedPath}`,
        );
      }
      if (!this.isAllowed) {
        continue;
      }

      const content = await entry.buffer();
      const language =
        this.fileLanguageService.getProjectLanguage(normalizedPath);
      const type = this.fileTypeService.projectType(normalizedPath);

      projectFiles.push({
        path: normalizedPath,
        content: content.toString(`utf-8`),
        language,
        type,
        size: content.length,
      });
    }
    return projectFiles;
  }
  private isIgnoredDirectory(path: string): boolean {
    const normalizedPath = path.replace(/\\/g, '/');
    return this.ignoredDirectories.some(
      (dir) => normalizedPath.startsWith(dir) || dir === normalizedPath,
    );
  }
  private isUnSafePath(path: string): boolean {
    const normalizedPath = path.replace(/\\/g, '/');
    return (
      normalizedPath.startsWith(`/`) ||
      normalizedPath.includes(`../`) ||
      normalizedPath.includes(`/..`) ||
      /^[a-zA-Z]:\//.test(normalizedPath)
    );
  }
  private isAllowed(path: string) {
    const normalizedPath = path.toLowerCase();
    ALLOWED_FILE_EXTENSIONS.some((extension) =>
      normalizedPath.endsWith(extension),
    );
  }
}
