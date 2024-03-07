import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";
import {
  FindAllProductsParams,
  ProductsRepository,
} from "../products-repository";

export class PrismaProductsRepository implements ProductsRepository {
  async findAllProducts({ query, page }: FindAllProductsParams) {
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      skip: (page - 1) * 12,
      take: 12,
    });

    return products;
  }

  async create(data: Product) {
    const product = await prisma.product.create({
      data: {
        idWoocommerce: data.idWoocommerce,
        name: data.name,
      },
    });

    return product;
  }

  async findByName(name: string) {
    const product = await prisma.product.findUnique({
      where: {
        name,
      },
    });

    return product;
  }
}
