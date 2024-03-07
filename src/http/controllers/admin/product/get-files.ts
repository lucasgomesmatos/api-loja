import { makeGetFilesUseCase } from "@/use-cases/factories/make-get-files-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getAllFilesByProductId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const filesQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    query: z.string().default(""),
  });

  const filesParamsSchema = z.object({
    productId: z.string().uuid(),
  });

  const { page, query } = filesQuerySchema.parse(request.query);
  const { productId } = filesParamsSchema.parse(request.params);

  try {
    const getAllFilesUseCase = makeGetFilesUseCase();

    const { files } = await getAllFilesUseCase.execute({
      productId,
      page,
      query,
    });

    return reply.send(files);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
