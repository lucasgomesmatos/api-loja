/*
  Warnings:

  - The primary key for the `tb_orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `tb_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `orderId` column on the `tb_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "tb_products" DROP CONSTRAINT "tb_products_orderId_fkey";

-- AlterTable
ALTER TABLE "tb_orders" DROP CONSTRAINT "tb_orders_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "tb_orders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tb_products" DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER;

-- AddForeignKey
ALTER TABLE "tb_products" ADD CONSTRAINT "tb_products_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "tb_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
