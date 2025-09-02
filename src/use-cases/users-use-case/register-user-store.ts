import { User } from "@prisma/client";
import { hash } from "bcryptjs";

import { UsersRepository } from "@/repositories/users-repository";

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
  constructor(private usersRepository: UsersRepository) { }

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

    const newCpfValue = cpf?.replace(/\D/g, "")
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    const passwordHash = await hash(newCpfValue!, 6);

    const user = await this.usersRepository.create({
      name: `${firstName} ${lastName}`,
      email,
      password_hash: passwordHash,
      phone,
      cpf: newCpfValue,
    });

    return { user };
  }
}
