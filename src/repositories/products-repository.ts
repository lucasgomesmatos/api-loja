import { Prisma, Product } from "@prisma/client";

export interface ProductsRepository {
  create(product: Prisma.ProductCreateInput): Promise<Product>;

  findAll(ids: number[]): Promise<Product[]>;

  findByName(name: string): Promise<Product | null>;
}
