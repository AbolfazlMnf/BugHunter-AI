import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/shared/guards/jwt.guard';
import { UploadProjectDto } from '../dtos/upload-project.dto';
import { ProjectsService } from '../services/projects.service';
import { ChunkFileService } from '../services/chunk-file.service';
import { EmbeddingFileService } from '../services/embedding-file.service';
import { User } from 'src/shared/decorators/user.decorator';
import { ProjectDto } from '../dtos/project.dto';
import { GeneralQueryDto } from 'src/shared/dtos/query.dto';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Role } from 'src/user/Schema/user.schema';
import { QdrantService } from 'src/vector/qdrant.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@ApiTags(`Projects`)
@Controller('projects')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly chunkFileService: ChunkFileService,
    private readonly embeddingFileService: EmbeddingFileService,
    private readonly qdrantService: QdrantService,
    @InjectQueue(`project-processing`) private readonly projectQueue: Queue,
  ) {}

  @Get()
  findUserProjects(@User() user: string, @Query() queries: GeneralQueryDto) {
    return this.projectsService.findUserProjects(user, queries);
  }

  @Get(`/admin`)
  @UseGuards(new RoleGuard([Role.Admin]))
  findAllProjects(@Query() queries: GeneralQueryDto) {
    return this.projectsService.findAllProjects(queries);
  }

  @Post()
  createNewProject(@User() user: string, @Body() body: ProjectDto) {
    return this.projectsService.createProject(body.name, user);
  }
  @Get(`/:id`)
  getOne(@Param(`id`) id: string) {
    return this.projectsService.findOne(id);
  }

  @Delete(`/:id`)
  deleteProject(@Param(`id`) id: string) {
    return this.projectsService.deleteProject(id);
  }

  @Post(`/:id/upload-file-zip`)
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
    @Param(`id`) id: string,
    @User() user: string,
  ) {
    if (!file.originalname.toLocaleLowerCase().endsWith(`.zip`)) {
      throw new BadRequestException('Only ZIP files are allowed');
    }

    const project = await this.projectsService.findExactProject(id, user);
    if (project.codebase !== null) {
      throw new BadRequestException(`this project has already codeBase !`);
    }

    await this.projectQueue.add(`process-project`, {
      projectId: id,
      userId: user,
    });

    const files = await this.projectsService.extractZip(file);
    const chunks = this.chunkFileService.chunkFiles(files);
    const embeddedChunks = await this.embeddingFileService.embeddingFiles(
      chunks,
      project._id.toString(),
      user,
    );

    await this.projectsService.addCodeBaseToProject(
      project._id.toString(),
      file,
    );

    await this.qdrantService.upsertEmbeddedChunks(embeddedChunks);
    console.log(embeddedChunks);

    return {
      totalFiles: files.length,
      totalChunks: embeddedChunks.length,
    };
  }
}
