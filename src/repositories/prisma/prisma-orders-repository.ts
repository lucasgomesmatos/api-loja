import { prisma } from "@/lib/prisma";
import { OrderProps, OrdersRepository } from "../orders-repository";

export class PrismaOrdersRepository implements OrdersRepository {
  async create(data: OrderProps): Promise<void> {
    await prisma.order.create({
      data: {
        status: data.status,
        id: data.id,
        userId: data.user_id,
        products_ids: data.products,
        json: data.json,
      },
    });
  }
}
