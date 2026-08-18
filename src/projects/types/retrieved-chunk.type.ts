export interface RetrievedChunk {
  content: string;
  path: string;
  language: string;
  type: string;
  startLine: number;
  endLine: number;
  score: number;
}
