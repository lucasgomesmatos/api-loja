import { PrismaFilesRepository } from "@/repositories/prisma/prisma-files-repository";
import { PrismaProductsRepository } from "@/repositories/prisma/prisma-products-repository";
import { CreateProductUseCase } from "../create-product";

export function makeCreateProductUseCase() {
  const prismaProductsRepository = new PrismaProductsRepository();
  const prismaFilesRepository = new PrismaFilesRepository();
  const createProductUseCase = new CreateProductUseCase(
    prismaProductsRepository,
    prismaFilesRepository,
  );

  return createProductUseCase;
}
