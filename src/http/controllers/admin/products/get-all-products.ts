import { makeGetAllProductsUseCase } from "@/use-cases/factories/make-get-all-products-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getAllProducts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const productBodySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    query: z.string().default(""),
  });

  const { page, query } = productBodySchema.parse(request.query);

  try {
    const getAllProductsUseCase = makeGetAllProductsUseCase();

    const { products } = await getAllProductsUseCase.execute({
      page,
      query,
    });

    return reply.send(products);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
