import path, { join } from 'path';
import sharp from 'sharp';
import * as fs from 'fs';

export const saveImage = async (file: Express.Multer.File, folder?: string) => {
  const destination = join(`files`, folder ?? ``);
  const base = path.parse(file.originalname).name;
  const fileName = `${Date.now()}-${base}.webp`;
  const filePath = path.join(destination, fileName);
  fs.mkdirSync(destination, { recursive: true });
  await sharp(file.buffer)
    .webp({ quality: 80 })
    .resize({
      width: 350,
      height: 500,
      fit: `cover`,
    })
    .toFile(filePath);
  return filePath;
};

export const saveImages = async (
  files: Array<Express.Multer.File>,
  folder?: string,
  width?: number,
  height?: number,
) => {
  const destination = join(`files`, folder ?? ``);
  fs.mkdirSync(destination, { recursive: true });
  const filePaths: string[] = [];

  for (const file of files) {
    const base = path.parse(file.originalname).name;
    const fileName = `${Date.now()}-${base}.webp`;
    const filePath = path.join(destination, fileName);
    await sharp(file.buffer)
      .webp({ quality: 80 })
      .resize({
        width: width || 300,
        height: height || 300,
        fit: `cover`,
      })
      .toFile(filePath);
    filePaths.push(filePath);
  }
  return filePaths;
};

export const deleteImages = async (paths: string[]) => {
  for (const path of paths) {
    try {
      await fs.promises.unlink(path);
    } catch (err) {
      console.log(err);
    }
  }
};
