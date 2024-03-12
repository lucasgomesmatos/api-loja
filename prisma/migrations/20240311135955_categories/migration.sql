/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `tb_files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tb_files" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "tb_products" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "tb_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_categories_name_key" ON "tb_categories"("name");

-- AddForeignKey
ALTER TABLE "tb_products" ADD CONSTRAINT "tb_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tb_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
