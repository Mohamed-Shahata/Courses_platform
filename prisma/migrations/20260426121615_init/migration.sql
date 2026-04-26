/*
  Warnings:

  - Added the required column `videoPublicId` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "videoPublicId" TEXT NOT NULL;
