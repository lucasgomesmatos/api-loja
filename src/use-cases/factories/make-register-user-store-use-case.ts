import { PrismaOrdersRepository } from "@/repositories/prisma/prisma-orders-repository";

import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { RegisterUserStoreUseCase } from "../users-use-case/register-user-store";

export function makeRegisterUserStoreUseCase() {
  const prismaUsersStoreRepository = new PrismaUsersRepository();
  const prismaOrdersRepository = new PrismaOrdersRepository();

  const registerUserUseCase = new RegisterUserStoreUseCase(
    prismaUsersStoreRepository,
    prismaOrdersRepository,
  );
  return registerUserUseCase;
}
