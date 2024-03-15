import { UsersRepository } from "@/repositories/users-repository";
import { ResourceNotFoundError } from "../erros/resource-not-found-error";

interface UpdateUserUseCaseRequest {
  userId: string;
  name: string;
  email: string;
}

export class UpdateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    userId,
    email,
    name,
  }: UpdateUserUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    await this.usersRepository.update(userId, {
      email,
      name,
    });
  }
}
