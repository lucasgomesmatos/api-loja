-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "tb_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "cpf" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_profiles" (
    "id" SERIAL NOT NULL,
    "avatar_url" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "tb_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_orders" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "tb_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_products" (
    "id" TEXT NOT NULL,
    "idWoocommerce" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "orderId" TEXT,

    CONSTRAINT "tb_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_files" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "tb_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_users_email_key" ON "tb_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tb_profiles_userId_key" ON "tb_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tb_products_idWoocommerce_key" ON "tb_products"("idWoocommerce");

-- AddForeignKey
ALTER TABLE "tb_profiles" ADD CONSTRAINT "tb_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tb_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_orders" ADD CONSTRAINT "tb_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tb_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_products" ADD CONSTRAINT "tb_products_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "tb_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_files" ADD CONSTRAINT "tb_files_productId_fkey" FOREIGN KEY ("productId") REFERENCES "tb_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
