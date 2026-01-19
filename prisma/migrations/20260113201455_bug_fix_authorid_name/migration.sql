/*
  Warnings:

  - You are about to drop the column `authodId` on the `posts` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "posts_authodId_idx";

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "authodId",
ADD COLUMN     "authorId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");
