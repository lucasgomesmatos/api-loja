/*
  Warnings:

  - The `idWoocommerce` column on the `tb_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tb_products" DROP COLUMN "idWoocommerce",
ADD COLUMN     "idWoocommerce" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "tb_products_idWoocommerce_key" ON "tb_products"("idWoocommerce");
