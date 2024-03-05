import { UsersRepository } from "@/repositories/users-repository";
import type { User } from "@prisma/client";
import { hash } from "bcryptjs";
import { UserAlreadyExistsError } from "./erros/user-already-exists-error";

interface RegisterUseCaseRequest {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  phone?: string;
}

interface RegisterUseCaseResponse {
  user: User;
}

export class RegisterUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
    cpf,
    phone,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const userWithEmailAlreadyExists =
      await this.usersRepository.findByEmail(email);

    if (userWithEmailAlreadyExists) throw new UserAlreadyExistsError();

    const passwordHash = await hash(password, 6);

    const user = await this.usersRepository.create({
      name,
      email,
      password_hash: passwordHash,
      cpf,
      phone,
    });

    return {
      user,
    };
  }
}
