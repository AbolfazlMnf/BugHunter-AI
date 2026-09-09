import { createHash } from 'crypto';

export const generateChunkId = (
  projectId: string,
  path: string,
  startLine: number,
  endLine: number,
) => {
  return createHash(`sha256`)
    .update(`${projectId}:${path}:${startLine}:${endLine}`)
    .digest(`hex`);
};
