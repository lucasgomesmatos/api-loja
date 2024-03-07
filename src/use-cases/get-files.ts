import { FilesRepository } from "@/repositories/files-repository";
import { File } from "@prisma/client";

interface GetFilesUseCaseRequest {
  productId: string;
  query: string;
  page: number;
}

interface GetFilesUseCaseResponse {
  files: File[];
}

export class GetFilesUseCase {
  constructor(private readonly filesRepository: FilesRepository) {}

  async execute({
    page,
    query,
    productId,
  }: GetFilesUseCaseRequest): Promise<GetFilesUseCaseResponse> {
    const files = await this.filesRepository.getAllFilesByProductId({
      productId,
      page,
      query,
    });

    return {
      files,
    };
  }
}
