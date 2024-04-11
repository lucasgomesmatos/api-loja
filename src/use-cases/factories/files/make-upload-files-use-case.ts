import { UploadFilesUseCase } from '@/use-cases/files-use-case/upload-files';
import { PrismaFilesRepository } from './../../../repositories/prisma/prisma-files-repository';

export function makeUploadFilesUseCase() {
  const prismaFilesRepository = new PrismaFilesRepository();
  const uploadFilesUseCase = new UploadFilesUseCase(prismaFilesRepository);
  return uploadFilesUseCase;
}