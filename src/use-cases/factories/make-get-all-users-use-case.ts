import { GetAllUsersUseCase } from "../users-use-case/get-all-users";

import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";

export function makeGetAllUsersUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const getUserProfileUseCase = new GetAllUsersUseCase(prismaUsersRepository);
  return getUserProfileUseCase;
}
