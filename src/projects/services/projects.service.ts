import { BadRequestException, Injectable } from '@nestjs/common';
import * as unzipper from 'unzipper';
import { IProjectFile } from '../types/project-file.type';
import { ALLOWED_FILE_EXTENSIONS } from '../constants/project-files.constants';

@Injectable()
export class ProjectsService {
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

      const content = entry.buffer();
      projectFiles.push({
        path: normalizedPath,
        content: (await content).toString(`utf-8`),
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
