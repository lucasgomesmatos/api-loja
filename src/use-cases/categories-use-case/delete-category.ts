import { CategoriesRepository } from "@/repositories/categories-repository";

interface DeleteCategoryUseCaseRequest {
  categoryId: string;
}

export class DeleteCategoryUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({ categoryId }: DeleteCategoryUseCaseRequest): Promise<void> {
    await this.categoriesRepository.deleteById(categoryId);
  }
}
