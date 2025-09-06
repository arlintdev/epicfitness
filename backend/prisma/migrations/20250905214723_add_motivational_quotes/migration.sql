-- CreateTable
CREATE TABLE "MotivationalQuote" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MotivationalQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MotivationalQuote_isActive_idx" ON "MotivationalQuote"("isActive");
