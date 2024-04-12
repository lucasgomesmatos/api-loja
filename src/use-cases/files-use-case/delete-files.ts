import { environment } from "@/env/env";
import { s3 } from "@/lib/aws-s3";
import { FilesRepository } from "@/repositories/files-repository";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";


interface DeleteFilesUseCaseRequest {
  deleteFiles: {
    id: number;
    keyFile: string;
  }[] | undefined;

}

export class DeleteFilesUseCase {
  constructor(
    private filesRepository: FilesRepository,
  ) { }

  async execute({
    deleteFiles
  }: DeleteFilesUseCaseRequest) {

    if (!deleteFiles) return;

    const filesId = deleteFiles.map((file) => file.id);

    await this.filesRepository.deleteAllFiles(filesId)

    const deleteCommands = deleteFiles.map((file) => {
      const deleteParams = {
        Bucket: environment.AWS_BUCKET_NAME,
        Key: file.keyFile,
      };
      return new DeleteObjectCommand(deleteParams);
    });

    await Promise.all(deleteCommands.map((command) => s3.send(command)));

  }
}
