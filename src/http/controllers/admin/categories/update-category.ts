import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeUpdateCategoryUseCase } from "@/use-cases/factories/categories/make-update-category-use-case";

export async function updateCategory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const categoryParamsSchema = z.object({
    categoryId: z.string(),
  });

  const categoryBodySchema = z.object({
    name: z.string(),
  });

  const { categoryId } = categoryParamsSchema.parse(request.params);
  const { name } = categoryBodySchema.parse(request.body);

  try {
    const updateCategoryUseCase = makeUpdateCategoryUseCase();

    const { category } = await updateCategoryUseCase.execute({
      categoryId,
      name,
    });

    return reply.send(category);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
