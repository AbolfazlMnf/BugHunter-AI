import { Injectable } from '@nestjs/common';
import { IChunkFile } from '../types/chunk-file.type';
import { embeddingChunks, EmbeddingInputType } from 'src/CORE/POST/embedding';

@Injectable()
export class EmbeddingFileService {
  async embeddingFiles(
    chunkFiles: IChunkFile[],
    type: EmbeddingInputType = EmbeddingInputType.Passage,
  ) {
    const embeddings = await embeddingChunks(chunkFiles, type);
    return embeddings;
  }
}
