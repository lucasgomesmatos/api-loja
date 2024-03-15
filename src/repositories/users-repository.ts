import { Prisma, User } from "@prisma/client";

export interface UsersRepository {
  findById(id: string): Promise<User | null>;

  create(data: Prisma.UserCreateInput): Promise<User>;

  findByEmail(email: string): Promise<User | null>;

  findAllUsers(): Promise<User[]>;

  update(id: string, data: Prisma.UserUpdateInput): Promise<void>;
}
