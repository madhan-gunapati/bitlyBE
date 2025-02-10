-- CreateTable
CREATE TABLE "Links" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "LongUrl" TEXT NOT NULL,
    "shortUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Links_pkey" PRIMARY KEY ("id")
);
