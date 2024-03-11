import { environment } from "@/env/env";
import { s3 } from "@/lib/aws-s3";
import { FilesRepository } from "@/repositories/files-repository";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface GetFilesUseCaseRequest {
  productId: string;
}

interface FileContent {
  id: number;
  name: string;
  url: string;
  keyFile: string;
  productId: string;
}

interface GetFilesUseCaseResponse {
  files: FileContent[];
}

export class GetFilesUseCase {
  constructor(private readonly filesRepository: FilesRepository) {}

  async execute({
    productId,
  }: GetFilesUseCaseRequest): Promise<GetFilesUseCaseResponse> {
    const files = await this.filesRepository.getAllFilesByProductId(productId);

    const content: FileContent[] = [];

    for (const file of files) {
      const signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: environment.AWS_BUCKET_NAME,
          Key: file.keyFile,
        }),
      );
      content.push({
        id: file.id,
        name: file.name,
        url: signedUrl,
        keyFile: file.keyFile,
        productId: file.productId,
      });
    }

    return {
      files: content,
    };
  }
}
