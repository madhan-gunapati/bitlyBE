/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Links` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Links_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Links_id_key" ON "Links"("id");
