/*
  Warnings:

  - You are about to drop the column `courseId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `lessonSessionId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `instructorId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the `LessonSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[courseId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sectionId` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Quiz` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('LESSON', 'COURSE');

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_lessonSessionId_fkey";

-- DropForeignKey
ALTER TABLE "LessonSession" DROP CONSTRAINT "LessonSession_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_lessonId_fkey";

-- DropIndex
DROP INDEX "Quiz_instructorId_key";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "courseId",
DROP COLUMN "lessonSessionId",
ADD COLUMN     "sectionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "instructorId",
ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "type" "QuizType" NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "lessonId" DROP NOT NULL;

-- DropTable
DROP TABLE "LessonSession";

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_courseId_key" ON "Quiz"("courseId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
