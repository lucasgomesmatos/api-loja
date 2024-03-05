import { InvalidCredentialsError } from "@/use-cases/erros/invalid-credentials-error";
import { makeAuthenticateUserStoreUseCase } from "@/use-cases/factories/make-authenticate-user-store-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function authenticateUserStore(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z.object({
    email: z.string().email(),
  });

  const { email } = authenticateBodySchema.parse(request.body);

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

    const refreshToken = await reply.jwtSign(
      {
        role: user.role,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "7d",
        },
      },
    );

    return reply
      .setCookie("refreshToken", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: true,
      })
      .status(200)
      .send({
        token,
      });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({
        message: error.message,
      });
    }
    throw error;
  }
}
