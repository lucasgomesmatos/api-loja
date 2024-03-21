import { makeGetAllProductsByUserUseCase } from "@/use-cases/factories/make-get-all-products-by-user-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getAllProductsByUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const productQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    query: z.string().default(""),
  });

  const { page, query } = productQuerySchema.parse(request.query);

  try {
    const getAllProductsByUserUseCase = makeGetAllProductsByUserUseCase();

    const { products, total } = await getAllProductsByUserUseCase.execute({
      page,
      query,
      userId: request.user.sub,
    });

    return reply.send({
      products,
      total,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
