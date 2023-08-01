/*
  Warnings:

  - You are about to alter the column `time` on the `plays` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[cover]` on the table `video` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[poster]` on the table `video` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `video` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `plays` MODIFY `time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `video_cover_key` ON `video`(`cover`);

-- CreateIndex
CREATE UNIQUE INDEX `video_poster_key` ON `video`(`poster`);

-- CreateIndex
CREATE UNIQUE INDEX `video_slug_key` ON `video`(`slug`);
