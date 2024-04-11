import { PrismaProductsRepository } from "@/repositories/prisma/prisma-products-repository";
import { CreateProductUseCase } from "@/use-cases/products-use-case/create-product";

export function makeCreateProductUseCase() {
  const prismaProductsRepository = new PrismaProductsRepository();
  const createProductUseCase = new CreateProductUseCase(prismaProductsRepository);
  return createProductUseCase;
}