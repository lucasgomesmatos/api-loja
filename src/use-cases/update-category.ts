import { Category } from "@prisma/client";
import { CategoriesRepository } from "./../repositories/categories-repository";
import { ResourceNotFoundError } from "./erros/resource-not-found-error";

interface UpdateProductUseCaseRequest {
  categoryId: string;
  name: string;
}

interface UpdateCategoryUseCaseResponse {
  category: Category;
}

export class UpdateCategoryUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({
    categoryId,
    name,
  }: UpdateProductUseCaseRequest): Promise<UpdateCategoryUseCaseResponse> {
    const categoryExists = await this.categoriesRepository.findById(categoryId);

    if (!categoryExists) {
      throw new ResourceNotFoundError();
    }

    const category = await this.categoriesRepository.update(categoryId, name);

    return {
      category,
    };
  }
}
