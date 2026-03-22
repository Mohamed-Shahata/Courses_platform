-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "status" "LessonStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileImage" TEXT;
