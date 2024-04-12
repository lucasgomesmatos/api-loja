import { PrismaProductsRepository } from "@/repositories/prisma/prisma-products-repository";
import { UpdateProductUseCase } from "@/use-cases/products-use-case/update-product";

export function makeUpdateProductUseCase() {
  const prismaProductsRepository = new PrismaProductsRepository();
  const updateProductUseCase = new UpdateProductUseCase(prismaProductsRepository);
  return updateProductUseCase;
}