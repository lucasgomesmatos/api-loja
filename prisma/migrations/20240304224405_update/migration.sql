/*
  Warnings:

  - You are about to drop the column `orderId` on the `tb_products` table. All the data in the column will be lost.
  - Added the required column `json` to the `tb_orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tb_products" DROP CONSTRAINT "tb_products_orderId_fkey";

-- AlterTable
ALTER TABLE "tb_orders" ADD COLUMN     "json" JSONB NOT NULL,
ADD COLUMN     "products_ids" INTEGER[];

-- AlterTable
ALTER TABLE "tb_products" DROP COLUMN "orderId";
