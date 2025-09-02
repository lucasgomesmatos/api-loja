import { RegisterUserStoreUseCase } from "../users-use-case/register-user-store";

import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";

export function makeRegisterUserStoreUseCase() {
  const prismaUsersStoreRepository = new PrismaUsersRepository();

  const registerUserUseCase = new RegisterUserStoreUseCase(
    prismaUsersStoreRepository,
  );
  return registerUserUseCase;
}
