import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { IChunkFile } from 'src/projects/types/chunk-file.type';

export interface INvidiaEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
}

export interface IEmbeddingResponse extends IChunkFile {
  embedding: number[];
  projectId: string;
  userId: string;
}
export interface IEmbeddingQueryResponse {
  embedding: number[];
  projectId: string;
  userId: string;
}

export const embeddingPassageChunks = async (
  chunks: IChunkFile[],
  projectId: string,
  userId: string,
): Promise<IEmbeddingResponse[]> => {
  if (chunks.length === 0) {
    return [];
  }
  const url = process.env.EMBEDDING_MODEL_URL;
  const apiKey = process.env.EMBEDDING_MODEL_KEY;

  if (!url) {
    throw new InternalServerErrorException(
      'EMBEDDING_MODEL_URL is not defined',
    );
  }

  if (!apiKey) {
    throw new InternalServerErrorException(
      'EMBEDDING_MODEL_KEY is not defined',
    );
  }
  const payload = {
    model: 'nvidia/nemotron-3-embed-1b',
    encoding_format: 'float',
    truncate: 'NONE',
    input: chunks.map((chunk) => chunk.content),
    input_type: `passage`,
  };
  try {
    const res = await axios.post<INvidiaEmbeddingResponse>(url, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const embeddings = res.data.data.sort((a, b) => a.index - b.index);

    const dimension = embeddings?.[0].embedding.length;
    console.log(dimension);

    if (!dimension) {
      throw new InternalServerErrorException(`Embedding vector is empty`);
    }
    const hasInvalidDimension = embeddings.some(
      (item) => item.embedding.length !== dimension,
    );
    if (hasInvalidDimension) {
      throw new InternalServerErrorException(
        `Embedding vectors have inconsistent dimensions`,
      );
    }

    if (embeddings.length !== chunks.length) {
      throw new InternalServerErrorException(
        `Mismatch between number of embeddings and number of chunks`,
      );
    }

    return chunks.map((chunk, index) => ({
      ...chunk,
      projectId,
      userId,
      embedding: embeddings[index].embedding,
    }));
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(`cant embedding files !`);
  }
};

export const embeddingQuery = async (
  incident: string,
  projectId: string,
  userId: string,
): Promise<IEmbeddingQueryResponse> => {
  const url = process.env.EMBEDDING_MODEL_URL;
  const apiKey = process.env.EMBEDDING_MODEL_KEY;

  if (!url) {
    throw new InternalServerErrorException(
      'EMBEDDING_MODEL_URL is not defined',
    );
  }

  if (!apiKey) {
    throw new InternalServerErrorException(
      'EMBEDDING_MODEL_KEY is not defined',
    );
  }
  const payload = {
    model: 'nvidia/nemotron-3-embed-1b',
    encoding_format: 'float',
    truncate: 'NONE',
    input: incident,
    input_type: `query`,
  };
  try {
    const res = await axios.post<INvidiaEmbeddingResponse>(url, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const embeddings = res.data.data;

    const dimension = embeddings?.[0]?.embedding.length;
    console.log(dimension);

    if (!dimension) {
      throw new InternalServerErrorException(`Embedding vector is empty`);
    }

    return {
      embedding: embeddings[0].embedding,
      projectId,
      userId,
    };
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Failed to generate query embedding',
    );
  }
};
