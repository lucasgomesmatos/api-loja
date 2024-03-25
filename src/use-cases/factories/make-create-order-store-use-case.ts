import { PrismaOrdersRepository } from "@/repositories/prisma/prisma-orders-repository";
import { CreateOrderUseCase } from "../orders-use-case/create-order";

export function makeCreateOrderStoreUseCase() {
  const prismaOrdersRepository = new PrismaOrdersRepository();

  const createOrderUseCase = new CreateOrderUseCase(prismaOrdersRepository);
  return createOrderUseCase;
}
