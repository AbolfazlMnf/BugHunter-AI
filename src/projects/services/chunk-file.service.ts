import { Injectable } from '@nestjs/common';
import { IChunkFile } from '../types/chunk-file.type';
import { IProjectFile } from '../types/project-file.type';

@Injectable()
export class ChunkFileService {
  private readonly chunkSize = 80;
  private readonly overlap = 10;

  chunkFile(file: IProjectFile): IChunkFile[] {
    let start = 0;
    const lines = file.content.split(`\n`);

    const chunks: IChunkFile[] = [];

    while (start < lines.length) {
      const end = Math.min(start + this.chunkSize, lines.length);
      const content = lines.slice(start, end).join(`\n`);
      chunks.push({
        content,
        path: file.path,
        type: file.type,
        language: file.language,
        startLine: start + 1,
        endLine: end,
      });
      if (end === lines.length) {
        break;
      }
      start = end - this.overlap;
    }
    return chunks;
  }

  chunkFiles(files: IProjectFile[]) {
    return files.flatMap((file) => this.chunkFile(file));
  }
}
