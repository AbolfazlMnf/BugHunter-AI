import { Injectable } from '@nestjs/common';

@Injectable()
export class FileTypeService {
  projectType(filePath: string): `documentation` | `config` | `source` {
    const normalizedPath = filePath.toLowerCase();
    if (normalizedPath.endsWith(`.md`) || normalizedPath.includes(`readme`)) {
      return `documentation`;
    } else if (
      normalizedPath.endsWith('package.json') ||
      normalizedPath.endsWith('tsconfig.json') ||
      normalizedPath.endsWith('.yaml') ||
      normalizedPath.endsWith('.yml')
    ) {
      return `config`;
    } else {
      return `source`;
    }
  }
}
