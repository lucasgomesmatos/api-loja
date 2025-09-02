import { UpdatePasswordUserUseCase } from "../users-use-case/update-password";

import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";

export function makeUpdatePasswordUserUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const updatePasswordUserUseCase = new UpdatePasswordUserUseCase(
    prismaUsersRepository,
  );
  return updatePasswordUserUseCase;
}
