-- CreateEnum
CREATE TYPE "KudosType" AS ENUM ('WORKOUT_START', 'EXERCISE_COMPLETE', 'REST_START', 'REST_COMPLETE', 'WORKOUT_COMPLETE', 'NEXT_EXERCISE', 'PERSONAL_RECORD');

-- CreateTable
CREATE TABLE "KudosPhrase" (
    "id" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "type" "KudosType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KudosPhrase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KudosPhrase_type_isActive_idx" ON "KudosPhrase"("type", "isActive");
