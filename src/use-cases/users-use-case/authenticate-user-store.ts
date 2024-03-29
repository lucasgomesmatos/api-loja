import { UsersRepository } from "@/repositories/users-repository";
import { User } from "@prisma/client";
import { InvalidCredentialsError } from "../erros/invalid-credentials-error";

interface AuthenticateUseCaseRequest {
  email: string;
}

interface AuthenticateUseCaseResponse {
  user: User;
}

export class AuthenticateUserStoreUseCase {
  constructor(private usersStoreRepository: UsersRepository) {}

  async execute({
    email,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersStoreRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    return {
      user,
    };
  }
}
