import { Category, Product } from "@prisma/client";

export interface FindAllProductsParams {
  query: string;
  page: number;
  categories: string[] | undefined;
}

export interface CreateProduct {
  name: string;
  idWoocommerce: number;
  categories: string[];
}

export interface ProductsRepository {
  create(data: CreateProduct): Promise<Product>;

  findByName(name: string): Promise<Product | null>;

  findById(id: string): Promise<Product | null>;

  deleteById(id: string): Promise<void>;

  findAllProducts(data: FindAllProductsParams): Promise<{
    products: Product[];
    total: number;
  }>;

  updateById(id: string, data: CreateProduct): Promise<Product>;

  getCategoryByProductId(productId: string): Promise<Category[]>;
}
