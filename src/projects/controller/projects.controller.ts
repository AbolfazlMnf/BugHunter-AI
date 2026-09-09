import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  InternalServerErrorException,
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
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { ProjectProcessingStatus } from '../types/project-file.type';

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
      throw new ConflictException('Project is already has a codebase');
    }

    let jobCreated = false;

    try {
      // just one project must be processed in the same time requests
      const pendingProject =
        await this.projectsService.startProjectProcessing(id);

      if (!pendingProject) {
        throw new ConflictException('Project is already being processed');
      }

      const uploadDir = join(process.cwd(), 'uploads', 'projects', id);
      await mkdir(uploadDir, { recursive: true });
      const filePath = join(uploadDir, file.originalname);
      await writeFile(filePath, file.buffer);

      await this.projectQueue.add(
        `process-zip-file`,
        {
          projectId: id,
          userId: user,
          filePath,
        },
        {
          attempts: 3,
          backoff: {
            type: `exponential`,
            delay: 10000,
          },
        },
      );
      jobCreated = true;

      return {
        message: 'Project processing started',
        projectId: project._id,
        status: ProjectProcessingStatus.Pending,
      };
    } catch (err) {
      if (!jobCreated) {
        await this.projectsService.resetProcessingStatus(id);
      }
      throw new InternalServerErrorException();
    }
  }

  @Delete('codebase/:id')
  deleteProjectCodeBase(@Param(`id`) id: string) {
    return this.projectsService.deleteCodeBase(id);
  }
}
