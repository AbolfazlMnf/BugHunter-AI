import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as unzipper from 'unzipper';
import { IProjectFile } from '../types/project-file.type';
import { ALLOWED_FILE_EXTENSIONS } from '../constants/project-files.constants';
import { FileTypeService } from './file-type.service';
import { FileLanguageService } from './file-language.service';
import { ChunkFileService } from './chunk-file.service';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../schemas/project.schema';
import { Model } from 'mongoose';
import { GeneralQueryDto } from 'src/shared/dtos/query.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    private readonly fileTypeService: FileTypeService,
    private readonly fileLanguageService: FileLanguageService,
    private readonly chunkFileService: ChunkFileService,
  ) {}
  private readonly ignoredDirectories = [
    'node_modules/',
    '.git/',
    'dist/',
    '.next/',
    'coverage/',
  ];
  async extractZip(file: Express.Multer.File): Promise<IProjectFile[]> {
    const directory = await unzipper.Open.buffer(file.buffer);
    const projectFiles: IProjectFile[] = [];

    for (const entry of directory.files) {
      const normalizedPath = entry.path.replace(/\\/g, '/');

      if (entry.type === 'Directory') {
        continue;
      }
      if (this.isIgnoredDirectory(normalizedPath)) {
        continue;
      }
      if (this.isUnSafePath(normalizedPath)) {
        throw new BadRequestException(
          `Unsafe path detected: ${normalizedPath}`,
        );
      }
      if (!this.isAllowed) {
        continue;
      }

      const content = await entry.buffer();
      const language =
        this.fileLanguageService.getProjectLanguage(normalizedPath);
      const type = this.fileTypeService.projectType(normalizedPath);

      projectFiles.push({
        path: normalizedPath,
        content: content.toString(`utf-8`),
        language,
        type,
        size: content.length,
      });
    }
    return projectFiles;
  }
  private isIgnoredDirectory(path: string): boolean {
    const normalizedPath = path.replace(/\\/g, '/');
    return this.ignoredDirectories.some(
      (dir) => normalizedPath.startsWith(dir) || dir === normalizedPath,
    );
  }
  private isUnSafePath(path: string): boolean {
    const normalizedPath = path.replace(/\\/g, '/');
    return (
      normalizedPath.startsWith(`/`) ||
      normalizedPath.includes(`../`) ||
      normalizedPath.includes(`/..`) ||
      /^[a-zA-Z]:\//.test(normalizedPath)
    );
  }
  private isAllowed(path: string) {
    const normalizedPath = path.toLowerCase();
    ALLOWED_FILE_EXTENSIONS.some((extension) =>
      normalizedPath.endsWith(extension),
    );
  }
  async createProject(name: string, userId: string) {
    const newProject = new this.projectModel({ name, userId });
    await newProject.save();
    await newProject.populate([
      {
        path: `userId`,
        select: `email`,
      },
    ]);
    return newProject;
  }
  async findOne(id: string) {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`project not found`);
    }
    return project;
  }
  async deleteProject(id: string) {
    const project = await this.findOne(id);
    await project.deleteOne();
    return { message: `project deleted successfully` };
  }
  async findExactProject(id: string, userId: string) {
    const project = await this.projectModel.findOne({ _id: id, userId }).exec();
    if (!project) {
      throw new NotFoundException(`project not found`);
    }
    return project;
  }
  async findUserProjects(userId: string, query: GeneralQueryDto) {
    const { page = 1, limit = 5 } = query;

    const [projects, count] = await Promise.all([
      this.projectModel
        .find({ userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments({ userId }).exec(),
    ]);
    return { page, limit, projects, count };
  }
  async findAllProjects(query: GeneralQueryDto) {
    const { page = 1, limit = 5 } = query;

    const [projects, count] = await Promise.all([
      this.projectModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments().exec(),
    ]);
    return { page, limit, projects, count };
  }
}
