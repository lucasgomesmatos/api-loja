import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeDeleteFilesUseCase } from "@/use-cases/factories/make-delete-files-use-case";

export async function deleteFiles(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const filesBodySchema = z.object({
    ids: z.array(z.coerce.number()),
  });
  const object = filesBodySchema.parse(request.body);

  try {
    const deleteFilesUseCase = makeDeleteFilesUseCase();
    await deleteFilesUseCase.execute({
      ids: object.ids,
    });

    return reply.send().status(204);
  } catch (error: unknown) {
    return reply.status(500).send({
      message: "Internal server error",
    });
  }
}
