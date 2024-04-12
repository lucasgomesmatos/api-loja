import { environment } from "@/env/env";
import { s3 } from "@/lib/aws-s3";
import { FilesRepository } from "@/repositories/files-repository";
import { ProductsRepository } from "@/repositories/products-repository";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ResourceNotFoundError } from "../erros/resource-not-found-error";

interface DeleteProductUseCaseRequest {
  productId: string;
}

export class DeleteProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly filesRepository: FilesRepository,
  ) { }

  async execute({ productId }: DeleteProductUseCaseRequest): Promise<void> {
    const product = await this.productsRepository.findById(productId);

    if (!product) throw new ResourceNotFoundError();

    const files = await this.filesRepository.getAllFilesByProductId(productId);

    const deleteCommands = files.map((file) => {
      const deleteParams = {
        Bucket: environment.AWS_BUCKET_NAME,
        Key: file.keyFile,
      };
      return new DeleteObjectCommand(deleteParams);
    });

    await Promise.all(deleteCommands.map((command) => s3.send(command)));

    await this.filesRepository.deleteALlFilesByProductId(product.id);
    await this.productsRepository.deleteById(product.id);
  }
}
