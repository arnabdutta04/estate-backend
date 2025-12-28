/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Property` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `address` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bathrooms` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bedrooms` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `condition` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingType` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pincode` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyType` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearBuilt` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'BROKER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'VILLA', 'HOUSE', 'FLAT', 'COMMERCIAL', 'LAND');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "Furnished" AS ENUM ('FULLY', 'SEMI', 'UNFURNISHED');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_RENOVATION');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'SOLD', 'RENTED', 'PENDING');

-- CreateEnum
CREATE TYPE "Specialization" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL');

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_ownerId_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "ownerId",
DROP COLUMN "type",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "area" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "bathrooms" INTEGER NOT NULL,
ADD COLUMN     "bedrooms" INTEGER NOT NULL,
ADD COLUMN     "brokerId" INTEGER,
ADD COLUMN     "condition" "Condition" NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "floors" INTEGER,
ADD COLUMN     "furnished" "Furnished" NOT NULL DEFAULT 'UNFURNISHED',
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "listingType" "ListingType" NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "pincode" TEXT NOT NULL,
ADD COLUMN     "propertyType" "PropertyType" NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "yearBuilt" INTEGER NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE "Broker" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "company" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "specialization" "Specialization"[],
    "servingAreas" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Broker_userId_key" ON "Broker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Broker_licenseNumber_key" ON "Broker"("licenseNumber");

-- AddForeignKey
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
