import { PrismaOrdersRepository } from "@/repositories/prisma/prisma-orders-repository";
import { PrismaUsersStoreRepository } from "@/repositories/prisma/prisma-users-store-repository";
import { RegisterUserStoreUseCase } from "../register-user-store";

export function makeRegisterUserStoreUseCase() {
  const prismaUsersStoreRepository = new PrismaUsersStoreRepository();
  const prismaOrdersRepository = new PrismaOrdersRepository();

  const registerUserUseCase = new RegisterUserStoreUseCase(
    prismaUsersStoreRepository,
    prismaOrdersRepository,
  );
  return registerUserUseCase;
}
