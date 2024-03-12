/*
  Warnings:

  - You are about to drop the column `categoryId` on the `tb_products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tb_products" DROP CONSTRAINT "tb_products_categoryId_fkey";

-- AlterTable
ALTER TABLE "tb_products" DROP COLUMN "categoryId";

-- CreateTable
CREATE TABLE "_CategoryToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToProduct_AB_unique" ON "_CategoryToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToProduct_B_index" ON "_CategoryToProduct"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "tb_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "tb_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
