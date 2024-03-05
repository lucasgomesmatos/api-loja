import { File } from "@prisma/client";

export interface FileProps {
  name: string;
  keyFile: string;
  productId: string;
}

export interface FilesRepository {
  create(data: FileProps): Promise<File>;
}
