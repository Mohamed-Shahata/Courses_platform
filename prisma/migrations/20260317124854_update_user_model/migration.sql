/*
  Warnings:

  - You are about to drop the column `api_key` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `api_secret_hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `business_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_balance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `webhook_url` on the `User` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');

-- DropIndex
DROP INDEX "User_api_key_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "api_key",
DROP COLUMN "api_secret_hash",
DROP COLUMN "business_name",
DROP COLUMN "currency",
DROP COLUMN "name",
DROP COLUMN "status",
DROP COLUMN "wallet_balance",
DROP COLUMN "webhook_url",
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'STUDENT';

-- DropEnum
DROP TYPE "AccountStatus";
