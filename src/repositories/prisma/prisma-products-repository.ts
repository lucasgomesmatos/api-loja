import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";
import { ProductsRepository } from "../products-repository";

export class PrismaProductsRepository implements ProductsRepository {
  async findAll(ids: number[]) {
    const products = await prisma.product.findMany({
      where: {
        idWoocommerce: {
          in: ids,
        },
      },
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
    const product = await prisma.product.findFirst({
      where: {
        name,
      },
    });

    return product;
  }
}
