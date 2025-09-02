import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { sendMailResetPassword } from "@/mail/nodemailer";
import { InvalidCredentialsError } from "@/use-cases/erros/invalid-credentials-error";
import { makeAuthenticateUserStoreUseCase } from "@/use-cases/factories/make-authenticate-user-store-use-case";

export async function forgotPassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const forgotPasswordBodySchema = z.object({
    email: z.string().email(),
  });

  const { email } = forgotPasswordBodySchema.parse(request.body);

  try {
    const authenticateUseCase = makeAuthenticateUserStoreUseCase();

    const { user } = await authenticateUseCase.execute({
      email,
    });

    const token = await reply.jwtSign(
      {
        role: user.role,
      },
      {
        sign: {
          sub: user.id,
        },
      },
    );

    await sendMailResetPassword(user.name, user.email, token);
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
