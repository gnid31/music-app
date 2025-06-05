/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Playlist_userId_name_key` ON `Playlist`(`userId`, `name`);
