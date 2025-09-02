import { ResourceNotFoundError } from "../erros/resource-not-found-error";

import { UsersRepository } from "@/repositories/users-repository";

interface UpdateUserUseCaseRequest {
  userId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export class UpdateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    userId,
    email,
    name,
    phone,
    cpf,
  }: UpdateUserUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    await this.usersRepository.update(userId, {
      email,
      name,
      phone,
      cpf,
    });
  }
}
