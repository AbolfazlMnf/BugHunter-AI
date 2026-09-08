export type TFileType = `documentation` | `source` | `config`;
export interface IProjectFile {
  path: string;
  content: string;
  language: string;
  type: TFileType;
  size: number;
}

export interface IProcessZipFileJobData {
  projectId: string;
  userId: string;
  filePath: string;
}

export enum ProjectProcessingStatus {
  NotStarted = `notStarted`,
  Pending = `pending`,
  Processing = `processing`,
  Completed = `completed`,
  Failed = `failed`,
}
