/*
  Warnings:

  - Added the required column `genre` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Song` ADD COLUMN `genre` VARCHAR(191) NOT NULL DEFAULT 'Unknown';