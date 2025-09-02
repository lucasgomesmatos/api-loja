import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeGetFilesUseCase } from "@/use-cases/factories/make-get-files-use-case";

export async function getAllFilesByProductId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const filesParamsSchema = z.object({
    productId: z.string().uuid(),
  });

  const { productId } = filesParamsSchema.parse(request.params);

  try {
    const getAllFilesUseCase = makeGetFilesUseCase();

    const { files, categories } = await getAllFilesUseCase.execute({
      productId,
    });

    return reply.send({
      files,
      categories,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
