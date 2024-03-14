import { makeGetAllProductsUseCase } from "@/use-cases/factories/make-get-all-products-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getAllProducts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const productQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    query: z.string().default(""),
    categories: z.string().optional(),
  });

  const { page, query, categories } = productQuerySchema.parse(request.query);

  const categoriesArray = categories?.split(",");

  try {
    const getAllProductsUseCase = makeGetAllProductsUseCase();

    const { products } = await getAllProductsUseCase.execute({
      page,
      query,
      categories: categoriesArray,
    });

    return reply.send(products);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
