import { Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class FileLanguageService {
  getProjectLanguage(filePath: string) {
    const extension = path.extname(filePath).toLowerCase();

    const languages: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.mjs': 'javascript',
      '.cjs': 'javascript',
      '.json': 'json',
      '.md': 'markdown',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
    };

    return languages[extension] ?? `unknown`;
  }
}
