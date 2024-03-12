import { PrismaCategoriesRepository } from "@/repositories/prisma/prisma-categories-repository";
import { GetAllCategoriesUseCase } from "@/use-cases/categories-use-case/get-all-categories";

export function makeGetAllCategoriesUseCase() {
  const prismaCategoriesRepository = new PrismaCategoriesRepository();
  const getAllCategoriesUseCase = new GetAllCategoriesUseCase(
    prismaCategoriesRepository,
  );

  return getAllCategoriesUseCase;
}
