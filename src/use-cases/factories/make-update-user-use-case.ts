import { UpdateUserUseCase } from "../users-use-case/update-user";

import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";

export function makeUpdateUserUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const getUserProfileUseCase = new UpdateUserUseCase(prismaUsersRepository);
  return getUserProfileUseCase;
}
