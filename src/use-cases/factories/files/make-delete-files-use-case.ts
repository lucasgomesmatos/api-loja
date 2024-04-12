
import { DeleteFilesUseCase } from '@/use-cases/files-use-case/delete-files';
import { PrismaFilesRepository } from './../../../repositories/prisma/prisma-files-repository';

export function makeDeleteFilesUseCase() {
  const prismaFilesRepository = new PrismaFilesRepository();
  const deleteFilesUseCase = new DeleteFilesUseCase(prismaFilesRepository);
  return deleteFilesUseCase;
}