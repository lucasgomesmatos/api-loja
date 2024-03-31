import { UsersRepository } from "@/repositories/users-repository";
import { hash } from "bcryptjs";
import { ResourceNotFoundError } from "../erros/resource-not-found-error";

interface UpdatePasswordUseCaseRequest {
  userId: string;
  password: string;
}

export class UpdatePasswordUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    password,
  }: UpdatePasswordUseCaseRequest): Promise<void> {
    const userWithExist = await this.usersRepository.findById(userId);

    if (!userWithExist) {
      throw new ResourceNotFoundError();
    }

    const passwordHash = await hash(password!, 6);

    await this.usersRepository.updatePassword(userId, passwordHash);
  }
}
