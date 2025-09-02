
import { S3ServiceException } from "@aws-sdk/client-s3";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { ProductAlreadyExistsError } from '@/use-cases/erros/product-already-exists-error';
import { makeUploadFilesUseCase } from '@/use-cases/factories/files/make-upload-files-use-case';
import { makeCreateProductUseCase } from "@/use-cases/factories/products/make-create-product-use-case";

export async function createProduct(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const productBodySchema = z.object({
    idWoocommerce: z.coerce.number(),
    name: z.string(),
    categories: z.array(z.string()),
    files: z.array(z.object({
      name: z.string(),
      contentType: z.string(),
    })),
  });



  const { name, idWoocommerce, categories, files: filesUpload } =
    productBodySchema.parse(request.body);

  try {
    const createProductUseCase = makeCreateProductUseCase();
    const uploadFilesUseCase = makeUploadFilesUseCase()

    const { productId } = await createProductUseCase.execute({
      name,
      idWoocommerce,
      categories,
    })

    const { files } = await uploadFilesUseCase.execute({
      productId,
      files: filesUpload
    })

    return reply.status(201).send(files);
  } catch (error) {
    if (error instanceof ProductAlreadyExistsError) {
      return reply.status(400).send({ message: "Product already exists" });
    }

    if (error instanceof S3ServiceException) {
      return reply.status(500).send({ message: "Error to upload file" });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
