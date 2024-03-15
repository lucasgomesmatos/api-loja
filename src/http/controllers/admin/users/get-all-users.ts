import { makeGetAllUsersUseCase } from "@/use-cases/factories/make-get-all-users-use-case";
import { FastifyReply, FastifyRequest } from "fastify";

export async function profile(_: FastifyRequest, reply: FastifyReply) {
  const getAllUsers = makeGetAllUsersUseCase();

  const { users } = await getAllUsers.execute();

  return reply.status(200).send({ users });
}
