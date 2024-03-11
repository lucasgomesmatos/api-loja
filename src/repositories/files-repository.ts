import { File } from "@prisma/client";

export interface FileProps {
  name: string;
  keyFile: string;
  productId: string;
}

export interface GetAllFileProps {
  query: string;
  page: number;
  productId: string;
}

export interface FilesRepository {
  create(data: FileProps): Promise<File>;

  getAllFilesByProductIdPaginate(data: GetAllFileProps): Promise<File[]>;

  getAllFilesByProductId(productId: string): Promise<File[]>;

  deleteALlFilesByProductId(productId: string): Promise<void>;

  deleteAllFiles(ids: number[]): Promise<void>;
}
