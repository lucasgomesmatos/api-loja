import { UsersRepository } from "@/repositories/users-repository";
import { User } from "@prisma/client";
import { hash } from "bcryptjs";

interface RegisterUserStoreUseCaseRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | undefined;
  cpf?: string | undefined;
}

interface RegisterUserStoreUseCaseResponse {
  user: User | null;
}

export class RegisterUserStoreUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    firstName,
    lastName,
    cpf,
    phone,
  }: RegisterUserStoreUseCaseRequest): Promise<RegisterUserStoreUseCaseResponse> {
    const userEmailExists = await this.usersRepository.findByEmail(email);

    if (userEmailExists) {
      return {
        user: userEmailExists,
      };
    }

    const passwordHash = await hash(cpf!, 6);

    const user = await this.usersRepository.create({
      name: `${firstName} ${lastName}`,
      email,
      password_hash: passwordHash,
      phone,
      cpf,
    });

    return { user };
  }
}
