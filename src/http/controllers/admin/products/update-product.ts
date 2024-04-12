import { makeUploadFilesUseCase } from '@/use-cases/factories/files/make-upload-files-use-case';

import { ResourceNotFoundError } from '@/use-cases/erros/resource-not-found-error';
import { makeDeleteFilesUseCase } from '@/use-cases/factories/files/make-delete-files-use-case';
import { makeUpdateProductUseCase } from '@/use-cases/factories/products/make-update-product-use-case';
import { S3ServiceException } from "@aws-sdk/client-s3";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function updateProduct(
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
    deleteFiles: z.array(z.object({
      id: z.number(),
      keyFile: z.string()
    })).optional()
  });

  const productParamsSchema = z.object({
    productId: z.string()
  })

  const { productId } = productParamsSchema.parse(request.params)

  const { name, idWoocommerce, categories, files: filesUpload, deleteFiles } =
    productBodySchema.parse(request.body);

  try {
    const updateProductUseCase = makeUpdateProductUseCase();
    const uploadFilesUseCase = makeUploadFilesUseCase()
    const deleteFilesUseCase = makeDeleteFilesUseCase()

    await updateProductUseCase.execute({
      productId,
      name,
      idWoocommerce,
      categories,
    })

    await deleteFilesUseCase.execute({
      deleteFiles
    })

    const { files } = await uploadFilesUseCase.execute({
      productId,
      files: filesUpload
    })

    return reply.status(201).send(files);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: "Product already exists" });
    }

    if (error instanceof S3ServiceException) {
      return reply.status(500).send({ message: "Error to upload file" });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
