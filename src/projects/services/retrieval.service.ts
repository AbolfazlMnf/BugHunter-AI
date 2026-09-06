import { Injectable, NotFoundException } from '@nestjs/common';
import { embeddingQuery } from 'src/CORE/POST/embedding';
import { QdrantService } from 'src/vector/qdrant.service';

@Injectable()
export class RetrievalService {
  constructor(private readonly qdrantService: QdrantService) {}

  private MIN_SCORE = 0.7;

  async retrievalIncident(incident: string, projectId: string, userId: string) {
    const embeddedIncident = await embeddingQuery(incident, projectId, userId);
    const queryResult = await this.qdrantService.search(
      embeddedIncident.embedding,
      projectId,
      userId,
    );
    console.log(queryResult);

    const relevantResults = queryResult.filter(
      (result) => result.score >= this.MIN_SCORE,
    );
    if (relevantResults.length === 0) {
      throw new NotFoundException('No relevant code found for this incident');
    }

    return relevantResults;
  }
}
