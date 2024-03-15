import { UsersRepository } from "@/repositories/users-repository";
import { User } from "@prisma/client";

interface GetAllUsersUseCaseResponse {
  users: Partial<User>[];
}

export class GetAllUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(): Promise<GetAllUsersUseCaseResponse> {
    const users = await this.usersRepository.findAllUsers();

    const usersPartial = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    });

    return {
      users: usersPartial,
    };
  }
}
