/*
  Warnings:

  - You are about to drop the `Links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Links" DROP CONSTRAINT "Links_userId_fkey";

-- DropTable
DROP TABLE "Links";

-- DropTable
DROP TABLE "User";
