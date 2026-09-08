import { unlink } from 'fs/promises';

export const deleteFile = async (filePath: string) => {
  try {
    await unlink(filePath);
    console.log(`temporary file deleted`);
  } catch (err) {
    console.log(`failed to delete temporary file`, err);
  }
};
