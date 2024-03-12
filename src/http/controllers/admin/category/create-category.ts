// makeCreateCategoryUseCase

import { makeCreateCategoryUseCase } from "@/use-cases/factories/make-create-category-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createCategory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const categoryBodySchema = z.object({
    name: z.string(),
  });

  const { name } = categoryBodySchema.parse(request.body);

  try {
    const createCategoryUseCase = makeCreateCategoryUseCase();

    const { category } = await createCategoryUseCase.execute({
      name,
    });

    return reply.send(category);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
