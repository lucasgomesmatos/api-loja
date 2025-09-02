import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { UserAlreadyExistsError } from "@/use-cases/erros/user-already-exists-error";
import { makeRegisterUseCase } from "@/use-cases/factories/make-register-user-use-case";


export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerUserBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    cpf: z.string().length(14),
    phone: z.string().length(15),
  });

  const { name, email, cpf, phone } = registerUserBodySchema.parse(
    request.body,
  );

  try {
    const registerUserUseCase = makeRegisterUseCase();

    await registerUserUseCase.execute({
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
