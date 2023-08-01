/*
  Warnings:

  - You are about to alter the column `time` on the `plays` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `plays` MODIFY `time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `video` ADD COLUMN `poster` VARCHAR(191) NULL,
    ADD COLUMN `slug` VARCHAR(191) NULL;
