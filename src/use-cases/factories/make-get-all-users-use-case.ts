import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { GetAllUsersUseCase } from "../users-use-case/get-all-users";

export function makeGetAllUsersUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const getUserProfileUseCase = new GetAllUsersUseCase(prismaUsersRepository);
  return getUserProfileUseCase;
}
