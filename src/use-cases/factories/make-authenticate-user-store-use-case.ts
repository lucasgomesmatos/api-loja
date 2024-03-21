import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { AuthenticateUserStoreUseCase } from "../users-use-case/authenticate-user-store";

export function makeAuthenticateUserStoreUseCase() {
  const prismaUsersStoreRepository = new PrismaUsersRepository();
  const authenticateUserStoreUseCase = new AuthenticateUserStoreUseCase(
    prismaUsersStoreRepository,
  );
  return authenticateUserStoreUseCase;
}
