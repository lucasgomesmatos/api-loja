import { prisma } from "@/lib/prisma";
import {
  CategoriesRepository,
  FindAllCategoriesParams,
} from "../categories-repository";

export class PrismaCategoriesRepository implements CategoriesRepository {
  async create(name: string) {
    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    return category;
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    return category;
  }

  async findByName(name: string) {
    const category = await prisma.category.findFirst({
      where: {
        name,
      },
    });

    return category;
  }

  async deleteById(id: string) {
    await prisma.category.delete({
      where: {
        id,
      },
    });
  }

  async update(categoryId: string, name: string) {
    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
      },
    });

    return category;
  }

  async findAllCategories(data: FindAllCategoriesParams) {
    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: data.query,
        },
      },
      skip: data.paginate ? (data.page - 1) * 12 : 0,
      take: data.paginate ? 12 : undefined,
    });

    return categories;
  }
}
