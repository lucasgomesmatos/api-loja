import { makeCreateCategoryUseCase } from "@/use-cases/factories/categories/make-create-category-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createCategory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  console.log(JSON.stringify(request.body));

  const categoryBodySchema = z.object({
    name: z.coerce.string(),
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
