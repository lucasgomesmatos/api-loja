import { prisma } from "@/lib/prisma";
import { OrderProps, OrdersRepository } from "../orders-repository";

export class PrismaOrdersRepository implements OrdersRepository {
  async create(data: OrderProps): Promise<void> {
    const { id, status, userId, productsIds, json } = data;

    await prisma.order.create({
      data: {
        id,
        status,
        userId,
        productsIds,
        json,
      },
    });
  }

  async findByUserId(userId: string) {
    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
    });

    return orders;
  }

  async findById(id: number) {
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    return order;
  }
}
