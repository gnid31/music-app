/*
  Warnings:

  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- AlterTable
ALTER TABLE `Artist` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Song` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `email`,
    ADD COLUMN `avatarUrl` VARCHAR(191) NULL;
