import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { UserAlreadyExistsError } from "@/use-cases/erros/user-already-exists-error";
import { makeUpdateUserUseCase } from "@/use-cases/factories/make-update-user-use-case";


export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
  const updateUserBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    cpf: z.string().length(14),
    phone: z.string().length(15),
  });

  const updateUserParamsSchema = z.object({
    userId: z.string().uuid(),
  });

  const { name, email, cpf, phone } = updateUserBodySchema.parse(request.body);

  const { userId } = updateUserParamsSchema.parse(request.params);

  try {
    const updateUserUseCase = makeUpdateUserUseCase();

    await updateUserUseCase.execute({
      userId,
      name,
      email,
      cpf,
      phone,
    });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(422).send({
        message: error.message,
      });
    }
    throw error;
  }

  return reply.status(201).send();
}
