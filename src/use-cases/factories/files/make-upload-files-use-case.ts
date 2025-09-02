import { PrismaFilesRepository } from './../../../repositories/prisma/prisma-files-repository';

import { UploadFilesUseCase } from '@/use-cases/files-use-case/upload-files';

export function makeUploadFilesUseCase() {
  const prismaFilesRepository = new PrismaFilesRepository();
  const uploadFilesUseCase = new UploadFilesUseCase(prismaFilesRepository);
  return uploadFilesUseCase;
}