import { ResourceNotFoundError } from "@/use-cases/erros/resource-not-found-error";
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

  console.log(request.user.sub);

  try {
    const updatePasswordUserUseCase = makeUpdatePasswordUserUseCase();

    await updatePasswordUserUseCase.execute({
      userId: request.user.sub,
      password,
    });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      });
    }
    throw error;
  }

  return reply.status(200).send();
}
