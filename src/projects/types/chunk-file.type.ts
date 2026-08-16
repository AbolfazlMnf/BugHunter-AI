import { IProjectFile, TFileType } from './project-file.type';

export interface IChunkFile {
  startLine: number;
  endLine: number;
  path: string;
  content: string;
  language: string;
  type: TFileType;
}
