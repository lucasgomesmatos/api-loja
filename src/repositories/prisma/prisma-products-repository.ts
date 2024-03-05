import { prisma } from "@/lib/prisma";
import { ProductsRepository } from "../products-repository";

export class PrismaProductsRepository implements ProductsRepository {
  async findAll(ids: number[]) {
    const products = await prisma.product.findMany({
      where: {
        id_woocommerce: {
          in: ids,
        },
      },
    });

    return products;
  }
}
