/*
  Warnings:

  - Added the required column `nameNormalized` to the `Artist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleNormalized` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Artist` ADD COLUMN `nameNormalized` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Song` ADD COLUMN `titleNormalized` VARCHAR(191) NOT NULL;
