/*
  Warnings:

  - You are about to drop the `_CategoryToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_B_fkey";

-- DropTable
DROP TABLE "_CategoryToProduct";

-- CreateTable
CREATE TABLE "ProductsOnCategories" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ProductsOnCategories_pkey" PRIMARY KEY ("productId","categoryId")
);

-- AddForeignKey
ALTER TABLE "ProductsOnCategories" ADD CONSTRAINT "ProductsOnCategories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tb_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnCategories" ADD CONSTRAINT "ProductsOnCategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tb_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
