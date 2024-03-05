import { Product } from "@prisma/client";

export interface ProductsRepository {
  findAll(ids: number[]): Promise<Product[]>;
}
