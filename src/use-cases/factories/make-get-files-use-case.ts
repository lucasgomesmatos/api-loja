import { PrismaFilesRepository } from "@/repositories/prisma/prisma-files-repository";
import { GetFilesUseCase } from "../get-files";

export function makeGetFilesUseCase() {
  const prismaFilesRepository = new PrismaFilesRepository();
  const getFilesUseCase = new GetFilesUseCase(prismaFilesRepository);

  return getFilesUseCase;
}
