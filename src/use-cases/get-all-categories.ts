import { Category } from "@prisma/client";
import { CategoriesRepository } from "./../repositories/categories-repository";

interface GetAllCategoriesUseCaseRequest {
  page: number;
  query: string;
  paginate: boolean;
}

interface GetAllCategoryUseCaseResponse {
  categories: Partial<Category>[];
}

export class GetAllCategoriesUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({
    page,
    paginate,
    query,
  }: GetAllCategoriesUseCaseRequest): Promise<GetAllCategoryUseCaseResponse> {
    const categories = await this.categoriesRepository.findAllCategories({
      page,
      paginate,
      query,
    });

    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    };
  }
}
