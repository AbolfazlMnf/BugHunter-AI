export type TFileType = `documentation` | `source` | `config`;
export interface IProjectFile {
  path: string;
  content: string;
  language: string;
  type: TFileType;
  size: number;
}
