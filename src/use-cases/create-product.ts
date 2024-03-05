import { environment } from "@/env/env";
import { s3 } from "@/lib/aws-s3";
import { FilesRepository } from "@/repositories/files-repository";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { ProductsRepository } from "./../repositories/products-repository";

interface CreateProductUseCaseRequest {
  nameProduct: string;
  idWoocommerce: number;
  contentType: string;
  nameFile: string;
}

interface CreateProductUseCaseResponse {
  signedUrl: string;
}

export class CreateProductUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private filesRepository: FilesRepository,
  ) {}

  async execute({
    nameProduct,
    idWoocommerce,
    contentType,
    nameFile,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    const { keyFile, signedUrl } = await this.uploadFile(nameFile, contentType);

    let product = await this.productsRepository.findByName(nameProduct);

    if (!product) {
      product = await this.productsRepository.create({
        name: nameProduct,
        idWoocommerce,
      });
    }

    await this.filesRepository.create({
      name: nameFile,
      keyFile,
      productId: product.id,
    });

    return { signedUrl };
  }

  private async uploadFile(nameFile: string, contentType: string) {
    const keyFile = randomUUID().concat("-").concat(nameFile);

    const signedUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: environment.AWS_BUCKET_NAME,
        Key: keyFile,
        ContentType: contentType,
      }),
      {
        expiresIn: 3600,
      },
    );
    return { keyFile, signedUrl };
  }
}
