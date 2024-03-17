import { Prisma, User } from "@prisma/client";

export interface GetAllUsers {
  query: string | undefined;
  page: number | undefined;
}

export interface UsersRepository {
  findById(id: string): Promise<User | null>;

  create(data: Prisma.UserCreateInput): Promise<User>;

  findByEmail(email: string): Promise<User | null>;

  findAllUsers(data: GetAllUsers): Promise<{
    users: User[];
    total: number;
  }>;

  update(id: string, data: Prisma.UserUpdateInput): Promise<void>;
}
