import { makeCreateProductUseCase } from "@/use-cases/factories/make-create-product-use-case";
import { S3ServiceException } from "@aws-sdk/client-s3";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function uploadFiles(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const productBodySchema = z.object({
    idWoocommerce: z.coerce.number(),
    nameProduct: z.string(),
    contentType: z.string(),
    nameFile: z.string(),
  });

  const { nameFile, contentType, idWoocommerce, nameProduct } =
    productBodySchema.parse(request.body);

  try {
    const createProductUseCase = makeCreateProductUseCase();

    const { signedUrl } = await createProductUseCase.execute({
      idWoocommerce,
      contentType,
      nameFile,
      nameProduct,
    });

    return reply.status(201).send({ signedUrl });
  } catch (error) {
    if (error instanceof S3ServiceException) {
      return reply.status(500).send({ message: "Error to upload file" });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
