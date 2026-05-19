import type { FilesystemService } from './types';

export const filesystemService: FilesystemService = {
  async pickFile() {
    throw new Error('filesystemService not implemented on iOS yet');
  },
  async saveFile() {
    throw new Error('filesystemService not implemented on iOS yet');
  },
  async share() {
    throw new Error('filesystemService not implemented on iOS yet');
  },
};
