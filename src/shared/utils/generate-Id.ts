import { createHash } from 'crypto';

export const generateChunkId = (
  projectId: string,
  path: string,
  content: string,
) => {
  return createHash(`sha256`)
    .update(`${projectId}:${path}:${content}`)
    .digest(`hex`);
};
