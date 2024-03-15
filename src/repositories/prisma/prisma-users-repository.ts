import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { UsersRepository } from "../users-repository";

export class PrismaUsersRepository implements UsersRepository {
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async create({
    name,
    email,
    password_hash,
    cpf,
    phone,
  }: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        cpf,
        phone,
      },
    });

    return user;
  }

  async findAllUsers() {
    const users = await prisma.user.findMany();

    return users;
  }

  async update(id: string, { name, email }: Prisma.UserUpdateInput) {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
      },
    });
  }
}
