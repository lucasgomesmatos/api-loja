import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { RegisterUserStoreUseCase } from "../users-use-case/register-user-store";

export function makeRegisterUserStoreUseCase() {
  const prismaUsersStoreRepository = new PrismaUsersRepository();

  const registerUserUseCase = new RegisterUserStoreUseCase(
    prismaUsersStoreRepository,
  );
  return registerUserUseCase;
}
