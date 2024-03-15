import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { UpdateUserUseCase } from "../users-use-case/update-user";

export function makeUpdateUserUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const getUserProfileUseCase = new UpdateUserUseCase(prismaUsersRepository);
  return getUserProfileUseCase;
}
