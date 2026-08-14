import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtGuard } from 'src/shared/guards/jwt.guard';
import { UploadProjectDto } from '../dtos/upload-project.dto';
import { ProjectsService } from '../services/projects.service';

@Controller('projects')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post(`upload-file-zip`)
  @ApiConsumes(`multipart/form-data`)
  @UseInterceptors(FileInterceptor(`file`))
  async uploadFileZip(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^(application\/zip|application\/x-zip-compressed)$/i,
          }),
          new MaxFileSizeValidator({
            maxSize: 20 * 1024 * 1024,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: UploadProjectDto,
  ) {
    if (!file.originalname.toLocaleLowerCase().endsWith(`.zip`)) {
      throw new BadRequestException('Only ZIP files are allowed');
    }
    const files = await this.projectsService.extractZip(file);
    return {
      totalFiles: files.length,
      files,
    };
  }
}
