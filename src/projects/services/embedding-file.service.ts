import { Injectable } from '@nestjs/common';
import { IChunkFile } from '../types/chunk-file.type';
import { embeddingPassageChunks } from 'src/CORE/POST/embedding';

@Injectable()
export class EmbeddingFileService {
  async embeddingFiles(
    chunkFiles: IChunkFile[],
    projectId: string,
    userId: string,
  ) {
    const embeddings = await embeddingPassageChunks(
      chunkFiles,
      projectId,
      userId,
    );
    return embeddings;
  }
}
