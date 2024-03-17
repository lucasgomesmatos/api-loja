import { makeGetAllUsersUseCase } from "@/use-cases/factories/make-get-all-users-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getAllUsers(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const UsersParamsSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    query: z.string().default(""),
  });

  const { query, page } = UsersParamsSchema.parse(request.query);

  const getAllUsers = makeGetAllUsersUseCase();

  const { users, total } = await getAllUsers.execute({
    page,
    query,
  });

  return reply.status(200).send({ users, total });
}
