import { PrismaFilesRepository } from "@/repositories/prisma/prisma-files-repository";
import { PrismaProductsRepository } from "@/repositories/prisma/prisma-products-repository";
import { DeleteProductUseCase } from "../products-use-case/delete-product";

export function makeDeleteProductUseCase() {
  const prismaProductsRepository = new PrismaProductsRepository();
  const prismaFilesRepository = new PrismaFilesRepository();
  const deleteProductUseCase = new DeleteProductUseCase(
    prismaProductsRepository,
    prismaFilesRepository,
  );

  return deleteProductUseCase;
}
