import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { UpdatePasswordUserUseCase } from "../users-use-case/update-password";

export function makeUpdatePasswordUserUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();
  const updatePasswordUserUseCase = new UpdatePasswordUserUseCase(
    prismaUsersRepository,
  );
  return updatePasswordUserUseCase;
}
