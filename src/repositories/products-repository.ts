import { Prisma, Product } from "@prisma/client";

export interface FindAllProductsParams {
  query: string;
  page: number;
}

export interface ProductsRepository {
  create(product: Prisma.ProductCreateInput): Promise<Product>;

  findByName(name: string): Promise<Product | null>;

  findById(id: string): Promise<Product | null>;

  deleteById(id: string): Promise<void>;

  findAllProducts(data: FindAllProductsParams): Promise<Product[]>;
}
