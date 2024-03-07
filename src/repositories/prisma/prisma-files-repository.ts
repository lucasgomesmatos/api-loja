import { prisma } from "@/lib/prisma";
import {
  FileProps,
  FilesRepository,
  GetAllFileProps,
} from "../files-repository";

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

  async getAllFilesByProductId(data: GetAllFileProps) {
    const { productId, page, query } = data;

    const files = await prisma.file.findMany({
      where: {
        productId,
        name: {
          contains: query,
        },
      },
      skip: (page - 1) * 12,
      take: 12,
    });

    return files;
  }
}
