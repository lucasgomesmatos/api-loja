import { InvalidCredentialsError } from "@/use-cases/erros/invalid-credentials-error";
import { makeUpdatePasswordUserUseCase } from "@/use-cases/factories/make-update-password-user-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function resetPassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const resetPasswordBodySchema = z.object({
    password: z.string().min(6),
  });

  const { password } = resetPasswordBodySchema.parse(request.body);

  try {
    const updatePasswordUserUseCase = makeUpdatePasswordUserUseCase();

    await updatePasswordUserUseCase.execute({
      userId: request.user.sub,
      password,
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({
        message: error.message,
      });
    }
    throw error;
  }

  return reply.status(200).send();
}
