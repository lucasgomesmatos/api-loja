import { AuthenticateUserStoreUseCase } from "../users-use-case/authenticate-user-store";

import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";

export function makeAuthenticateUserStoreUseCase() {
  const prismaUsersStoreRepository = new PrismaUsersRepository();
  const authenticateUserStoreUseCase = new AuthenticateUserStoreUseCase(
    prismaUsersStoreRepository,
  );
  return authenticateUserStoreUseCase;
}
