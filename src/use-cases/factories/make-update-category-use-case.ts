import { PrismaCategoriesRepository } from "@/repositories/prisma/prisma-categories-repository";
import { UpdateCategoryUseCase } from "../update-category";

export function makeUpdateCategoryUseCase() {
  const prismaCategoriesRepository = new PrismaCategoriesRepository();
  const updateCategoryUseCase = new UpdateCategoryUseCase(
    prismaCategoriesRepository,
  );

  return updateCategoryUseCase;
}
