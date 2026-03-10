/*
  Warnings:

  - A unique constraint covering the columns `[api_key]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `api_key` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `api_secret_hash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `business_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "api_key" TEXT NOT NULL,
ADD COLUMN     "api_secret_hash" TEXT NOT NULL,
ADD COLUMN     "business_name" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "wallet_balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "webhook_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_api_key_key" ON "User"("api_key");
