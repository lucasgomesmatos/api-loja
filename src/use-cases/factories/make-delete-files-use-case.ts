import { PrismaFilesRepository } from "@/repositories/prisma/prisma-files-repository";
import { DeleteFilesUseCase } from "../files-use-case/delete-files";

export function makeDeleteFilesUseCase() {
  const prismaFilesRepository = new PrismaFilesRepository();
  const deleteFilesUseCase = new DeleteFilesUseCase(prismaFilesRepository);

  return deleteFilesUseCase;
}
