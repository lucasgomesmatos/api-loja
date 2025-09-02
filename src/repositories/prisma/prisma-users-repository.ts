import { Prisma } from "@prisma/client";

import { GetAllUsers, UsersRepository } from "../users-repository";

import { prisma } from "@/lib/prisma";

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

  async findAllUsers(data: GetAllUsers) {
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: data.query,
              },
            },
            {
              email: {
                contains: data.query,
              },
            },
          ],
        },
        take: data.page ? 8 : undefined,
        skip: data.page ? (data.page - 1) * 8 : 0,
      }),

      prisma.user.count({
        where: {
          OR: [
            {
              name: {
                contains: data.query,
              },
            },
            {
              email: {
                contains: data.query,
              },
            },
          ],
        },
      }),
    ]);

    return {
      users,
      total,
    };
  }

  async update(
    id: string,
    { name, email, phone, cpf }: Prisma.UserUpdateInput,
  ) {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        phone,
        cpf,
      },
    });
  }

  async updatePassword(id: string, password: string) {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password_hash: password,
      },
    });
  }
}
