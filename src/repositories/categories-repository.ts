import { Category } from "@prisma/client";

export interface FindAllCategoriesParams {
  page: number;
  query: string;
  paginate: boolean;
}

export interface CategoriesRepository {
  create(name: string): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  deleteById(id: string): Promise<void>;
  update(categoryId: string, name: string): Promise<Category>;
  findByName(name: string): Promise<Category | null>;
  findAllCategories(data: FindAllCategoriesParams): Promise<{
    categories: Category[];
    total: number;
  }>;
}
