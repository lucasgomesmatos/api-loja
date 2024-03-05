import { UserAlreadyExistsError } from "@/use-cases/erros/user-already-exists-error";
import { makeRegisterUseCase } from "@/use-cases/factories/make-register-user-use-case";

import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerUserBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    cpf: z.string().optional(),
    phone: z.string().optional(),
  });

  const { name, email, password, cpf, phone } = registerUserBodySchema.parse(
    request.body,
  );

  try {
    const registerUserUseCase = makeRegisterUseCase();

    await registerUserUseCase.execute({
      name,
      email,
      password,
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
