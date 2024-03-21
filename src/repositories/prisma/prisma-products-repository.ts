import { prisma } from "@/lib/prisma";
import {
  CreateProduct,
  FindAllProductsParams,
  ProductsRepository,
} from "../products-repository";

export class PrismaProductsRepository implements ProductsRepository {
  async findAllProducts({ query, page, categories }: FindAllProductsParams) {
    if (!categories) {
      const [products, total] = await prisma.$transaction([
        prisma.product.findMany({
          where: {
            name: {
              contains: query,
            },
          },
          skip: (page - 1) * 16,
          take: 16,
        }),
        prisma.product.count(),
      ]);

      return {
        products,
        total,
      };
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
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
      }),
      prisma.product.count(),
    ]);

    return {
      products,
      total,
    };
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
    await prisma.$transaction([
      prisma.productsOnCategories.deleteMany({
        where: {
          productId: id,
        },
      }),

      prisma.product.delete({
        where: {
          id,
        },
      }),
    ]);
  }

  async getCategoryByProductId(productId: string) {
    const categoriesAll = await prisma.productsOnCategories.findMany({
      where: {
        productId,
      },
      select: {
        category: true,
      },
    });

    const categories = categoriesAll.map((item) => item.category);

    return categories;
  }

  async updateById(id: string, data: CreateProduct) {
    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        idWoocommerce: data.idWoocommerce,
        name: data.name,
      },
    });

    await prisma.productsOnCategories.deleteMany({
      where: {
        productId: product.id,
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

  async getAllProductsById(productsIds: string[]) {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productsIds,
        },
      },
    });

    return products;
  }

  async getAllProductsByIdWoocommerce(
    page: number,
    query: string,
    productsIds: number[],
  ) {
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: {
          idWoocommerce: {
            in: productsIds,
          },
          name: {
            contains: query,
          },
        },

        skip: (page - 1) * 16,
        take: 16,
      }),
      prisma.product.count(),
    ]);

    return {
      products,
      total,
    };
  }
}
