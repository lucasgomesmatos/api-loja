import { PrismaCategoriesRepository } from "@/repositories/prisma/prisma-categories-repository";
import { DeleteCategoryUseCase } from "@/use-cases/categories-use-case/delete-category";

export function makeDeleteCategoryUseCase() {
  const prismaCategoriesRepository = new PrismaCategoriesRepository();
  const deleteCategoryUseCase = new DeleteCategoryUseCase(
    prismaCategoriesRepository,
  );

  return deleteCategoryUseCase;
}
