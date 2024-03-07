import { PrismaProductsRepository } from "@/repositories/prisma/prisma-products-repository";
import { GetAllProductsUseCase } from "../get-all-products";

export function makeGetAllProductsUseCase() {
  const prismaProductsRepository = new PrismaProductsRepository();
  const getAllProductsUseCase = new GetAllProductsUseCase(
    prismaProductsRepository,
  );

  return getAllProductsUseCase;
}
