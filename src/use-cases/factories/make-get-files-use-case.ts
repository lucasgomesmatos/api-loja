import { PrismaFilesRepository } from "@/repositories/prisma/prisma-files-repository";
import { PrismaProductsRepository } from "@/repositories/prisma/prisma-products-repository";
import { GetFilesUseCase } from "../get-files";

export function makeGetFilesUseCase() {
  const prismaFilesRepository = new PrismaFilesRepository();
  const productsRepository = new PrismaProductsRepository();
  const getFilesUseCase = new GetFilesUseCase(
    prismaFilesRepository,
    productsRepository,
  );

  return getFilesUseCase;
}
