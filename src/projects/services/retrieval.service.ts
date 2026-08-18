import { Injectable, NotFoundException } from '@nestjs/common';
import { embeddingQuery } from 'src/CORE/POST/embedding';
import { QdrantService } from 'src/vector/qdrant.service';

@Injectable()
export class RetrievalService {
  constructor(private readonly qdrantService: QdrantService) {}
  async retrievalIncident(incident: string, projectId: string, userId: string) {
    const embeddedIncident = await embeddingQuery(incident, projectId, userId);
    const queryResult = await this.qdrantService.search(
      embeddedIncident.embedding,
      projectId,
      userId,
    );
    console.log(queryResult);
    if (queryResult.length === 0) {
      throw new NotFoundException(`no vector result found `);
    }
    return queryResult;
  }
}
