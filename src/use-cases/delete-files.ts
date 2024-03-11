import { FilesRepository } from "@/repositories/files-repository";

interface DeleteFilesUseCaseRequest {
  ids: number[];
}

export class DeleteFilesUseCase {
  constructor(private readonly filesRepository: FilesRepository) {}

  async execute({ ids }: DeleteFilesUseCaseRequest): Promise<void> {
    await this.filesRepository.deleteAllFiles(ids);
  }
}
