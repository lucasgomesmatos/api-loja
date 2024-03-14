import { prisma } from "@/lib/prisma";
import {
  CreateProduct,
  FindAllProductsParams,
  ProductsRepository,
} from "../products-repository";

export class PrismaProductsRepository implements ProductsRepository {
  async findAllProducts({ query, page, categories }: FindAllProductsParams) {
    if (categories) {
      return await prisma.product.findMany({
        where: {
          name: {
            contains: query,
          },
          products: {
            some: {
              categoryId: {
                in: categories,
              },
            },
          },
        },

        skip: (page - 1) * 16,
        take: 16,
      });
    }

    return await prisma.product.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      skip: (page - 1) * 16,
      take: 16,
    });
  }

  async create(data: CreateProduct) {
    const product = await prisma.product.create({
      data: {
        idWoocommerce: data.idWoocommerce,
        name: data.name,
      },
    });

    await prisma.productsOnCategories.createMany({
      data: data.categories.map((categoryId) => ({
        productId: product.id,
        categoryId,
      })),
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

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    return product;
  }

  async deleteById(id: string) {
    await prisma.product.delete({
      where: {
        id,
      },
    });
  }
}
