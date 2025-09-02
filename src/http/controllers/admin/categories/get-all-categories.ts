import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeGetAllCategoriesUseCase } from "@/use-cases/factories/categories/make-get-all-categories-use-case";

export async function getAllCategories(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const categoryQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    query: z.string().default(""),
    paginate: z.coerce.boolean().default(false),
  });

  const { page, query, paginate } = categoryQuerySchema.parse(request.query);

  try {
    const getAllCategoriesUseCase = makeGetAllCategoriesUseCase();

    const { categories, total } = await getAllCategoriesUseCase.execute({
      page,
      query,
      paginate,
    });

    return reply.send({
      categories,
      total,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
