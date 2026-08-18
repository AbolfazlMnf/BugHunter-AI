import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { IEmbeddingResponse } from 'src/CORE/POST/embedding';
import { RetrievedChunk } from 'src/projects/types/retrieved-chunk.type';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly client: QdrantClient;
  private readonly collectionName = `bug-detective`;

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL ?? 'http://localhost:6333',
    });
  }

  async onModuleInit() {
    await this.createCollection();
  }

  async createCollection() {
    const collections = await this.client.getCollections();
    const isExist = collections.collections.some(
      (collection) => collection.name === this.collectionName,
    );
    if (isExist) {
      return;
    }
    await this.client.createCollection(this.collectionName, {
      vectors: {
        size: 2048,
        distance: `Cosine`,
      },
    });
  }

  async upsertEmbeddedChunks(chunks: IEmbeddingResponse[]) {
    await this.client.upsert(this.collectionName, {
      wait: true,
      points: chunks.map((chunk) => ({
        id: uuidv4(),

        vector: chunk.embedding,

        payload: {
          path: chunk.path,
          content: chunk.content,
          type: chunk.type,
          language: chunk.language,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          projectId: chunk.projectId,
          userId: chunk.userId,
        },
      })),
    });
  }

  async search(
    queryVector: number[],
    projectId: string,
    userId: string,
    limit: number = 5,
  ): Promise<RetrievedChunk[]> {
    const results = await this.client.query(this.collectionName, {
      query: queryVector,
      limit,

      with_payload: true,

      filter: {
        must: [
          {
            key: `projectId`,
            match: {
              value: projectId,
            },
          },
          {
            key: `userId`,
            match: {
              value: userId,
            },
          },
        ],
      },
    });
    return results.points.map((result) => ({
      content: result.payload?.content as string,
      path: result.payload?.path as string,
      language: result.payload?.language as string,
      type: result.payload?.type as string,
      startLine: result.payload?.startLine as number,
      endLine: result.payload?.endLine as number,
      score: result.score,
    }));
  }
}
