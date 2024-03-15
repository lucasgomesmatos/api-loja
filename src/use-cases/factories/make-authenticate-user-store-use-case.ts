import { PrismaUsersStoreRepository } from "@/repositories/prisma/prisma-users-store-repository";
import { AuthenticateUserStoreUseCase } from "../users-use-case/authenticate-user-store";

export function makeAuthenticateUserStoreUseCase() {
  const prismaUsersStoreRepository = new PrismaUsersStoreRepository();
  const authenticateUserStoreUseCase = new AuthenticateUserStoreUseCase(
    prismaUsersStoreRepository,
  );
  return authenticateUserStoreUseCase;
}
