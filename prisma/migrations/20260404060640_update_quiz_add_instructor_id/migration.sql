/*
  Warnings:

  - You are about to drop the column `courseId` on the `Quiz` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[instructorId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `instructorId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_courseId_fkey";

-- DropIndex
DROP INDEX "Quiz_courseId_key";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "courseId",
ADD COLUMN     "instructorId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_instructorId_key" ON "Quiz"("instructorId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
