import { ResourceNotFoundError } from "@/use-cases/erros/resource-not-found-error";
import { makeDeleteProductUseCase } from "@/use-cases/factories/make-delete-product-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function deleteProduct(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const filesParamsSchema = z.object({
    productId: z.string().uuid(),
  });

  const { productId } = filesParamsSchema.parse(request.params);

  try {
    const deleteProductUseCase = makeDeleteProductUseCase();
    await deleteProductUseCase.execute({
      productId,
    });

    return reply.send().status(204);
  } catch (error: unknown) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: "Product not found",
      });
    }

    return reply.status(500).send({
      message: "Internal server error",
    });
  }
}
