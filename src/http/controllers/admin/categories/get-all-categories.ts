import { makeGetAllCategoriesUseCase } from "@/use-cases/factories/categories/make-get-all-categories-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getAllCategories(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const productBodySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    query: z.string().default(""),
    paginate: z.coerce.boolean().default(false),
  });

  const { page, query, paginate } = productBodySchema.parse(request.query);

  try {
    const getAllCategoriesUseCase = makeGetAllCategoriesUseCase();

    const { categories } = await getAllCategoriesUseCase.execute({
      page,
      query,
      paginate,
    });

    return reply.send(categories);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
