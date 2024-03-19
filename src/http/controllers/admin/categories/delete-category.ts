import { makeDeleteCategoryUseCase } from "@/use-cases/factories/categories/make-delete-category-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function deleteCategory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const categoryParamsSchema = z.object({
    categoryId: z.string(),
  });

  const { categoryId } = categoryParamsSchema.parse(request.params);

  try {
    const deleteCategoryUseCase = makeDeleteCategoryUseCase();

    await deleteCategoryUseCase.execute({
      categoryId,
    });

    return reply.send().status(204);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
