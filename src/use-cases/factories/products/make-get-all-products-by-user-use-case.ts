import { PrismaOrdersRepository } from "@/repositories/prisma/prisma-orders-repository";
import { PrismaProductsRepository } from "@/repositories/prisma/prisma-products-repository";
import { GetAllProductsByUserUseCase } from "@/use-cases/products-use-case/get-all-products-by-user";

export function makeGetAllProductsByUserUseCase() {
  const prismaProductsRepository = new PrismaProductsRepository();
  const prismaOrdersRepository = new PrismaOrdersRepository();

  const getAllProductsByUserUseCase = new GetAllProductsByUserUseCase(
    prismaProductsRepository,
    prismaOrdersRepository,
  );
  return getAllProductsByUserUseCase;
}
