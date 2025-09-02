import { User } from "@prisma/client";

import { UsersRepository } from "@/repositories/users-repository";

interface GetAllUsersUseCaseRequest {
  query: string | undefined;
  page: number | undefined;
}

interface GetAllUsersUseCaseResponse {
  users: Partial<User>[];
  total: number;
}

export class GetAllUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    page,
    query,
  }: GetAllUsersUseCaseRequest): Promise<GetAllUsersUseCaseResponse> {
    const { users, total } = await this.usersRepository.findAllUsers({
      page,
      query,
    });

    const usersPartial = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
      };
    });

    return {
      users: usersPartial,
      total,
    };
  }
}
