/*
  Warnings:

  - You are about to drop the column `idWoocommerce` on the `tb_products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_woocommerce]` on the table `tb_products` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tb_products_idWoocommerce_key";

-- AlterTable
ALTER TABLE "tb_products" DROP COLUMN "idWoocommerce",
ADD COLUMN     "id_woocommerce" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "tb_products_id_woocommerce_key" ON "tb_products"("id_woocommerce");
