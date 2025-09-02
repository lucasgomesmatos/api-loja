import { CreateOrderUseCase } from "../orders-use-case/create-order";

import { PrismaOrdersRepository } from "@/repositories/prisma/prisma-orders-repository";

export function makeCreateOrderStoreUseCase() {
  const prismaOrdersRepository = new PrismaOrdersRepository();

  const createOrderUseCase = new CreateOrderUseCase(prismaOrdersRepository);
  return createOrderUseCase;
}
