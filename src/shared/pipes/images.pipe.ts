import {
  BadRequestException,
  FileTypeValidator,
  Injectable,
  MaxFileSizeValidator,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ImagesPipe implements PipeTransform {
  async transform(files: Array<Express.Multer.File>) {
    const sizeValidator = new MaxFileSizeValidator({
      maxSize: 20000000,
    });
    const fileTypeValidator = new FileTypeValidator({
      fileType: /(image\/jpeg|image\/png|image\/jpg|image\/webp)/,
    });
    for (const image of files) {
      if (!sizeValidator.isValid(image)) {
        throw new BadRequestException(
          `Image "${image.originalname}" exceeds the maximum size of 20 MB.`,
        );
      }
      if (!(await fileTypeValidator.isValid(image))) {
        throw new BadRequestException(
          `the type of ${image.originalname} is not supported`,
        );
      }
    }

    return files;
  }
}
