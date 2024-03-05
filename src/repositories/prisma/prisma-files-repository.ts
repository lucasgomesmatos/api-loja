import { prisma } from "@/lib/prisma";
import { FileProps, FilesRepository } from "../files-repository";

export class PrismaFilesRepository implements FilesRepository {
  async create(data: FileProps) {
    const { name, keyFile, productId } = data;

    const file = await prisma.file.create({
      data: {
        name,
        keyFile,
        productId,
      },
    });

    return file;
  }
}
