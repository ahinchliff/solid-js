/*
  Warnings:

  - Made the column `customerId` on table `Purchase` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_customerId_fkey";

-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "customerId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Spend" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "credit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Spend_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Spend" ADD CONSTRAINT "Spend_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
