import { environment } from "@/env/env";
import { s3 } from "@/lib/aws-s3";
import { FilesRepository } from "@/repositories/files-repository";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

interface FileContent {
  name: string;
  contentType: string;
}

interface UploadFilesProps {
  name: string;
  keyFile: string;
  signedUrl: string
}

interface UploadFilesUseCaseRequest {
  productId: string;
  files: FileContent[]
}

interface UploadFilesUseCaseResponse {
  files: UploadFilesProps[]
}

export class UploadFilesUseCase {
  constructor(
    private filesRepository: FilesRepository,
  ) { }

  async execute({
    productId,
    files
  }: UploadFilesUseCaseRequest): Promise<UploadFilesUseCaseResponse> {
    const uploadFiles = await this.uploadFile(files);

    for (const file of uploadFiles) {
      const { name, keyFile } = file;

      await this.filesRepository.create({
        name,
        keyFile,
        productId,
      });
    }
    return { files: uploadFiles };
  }

  private async uploadFile(files: FileContent[]): Promise<UploadFilesProps[]> {

    const uploadFiles: UploadFilesProps[] = [];

    for (const file of files) {
      const { name, contentType } = file;
      const keyFile = randomUUID().concat("-").concat(name);

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
      uploadFiles.push({ name, keyFile, signedUrl });
    }

    return uploadFiles
  }
}
