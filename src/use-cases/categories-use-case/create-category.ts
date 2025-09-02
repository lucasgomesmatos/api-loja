import { Category } from "@prisma/client";

import { CategoryAlreadyExistsError } from "../erros/category-already-exists-error";

import { CategoriesRepository } from "@/repositories/categories-repository";

interface CreateProductUseCaseRequest {
  name: string;
}

interface CreateCategoryUseCaseResponse {
  category: Category;
}

export class CreateCategoryUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({
    name,
  }: CreateProductUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
    const categoryExists = await this.categoriesRepository.findByName(name);

    if (categoryExists) {
      throw new CategoryAlreadyExistsError();
    }

    const category = await this.categoriesRepository.create(name);

    return {
      category,
    };
  }
}
