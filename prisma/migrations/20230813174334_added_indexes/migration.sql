/*
  Warnings:

  - You are about to alter the column `time` on the `plays` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `plays` MODIFY `time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `star_haircolor_idx` ON `star`(`haircolor`);

-- CreateIndex
CREATE INDEX `star_hairstyle_idx` ON `star`(`hairstyle`);

-- CreateIndex
CREATE INDEX `star_breast_idx` ON `star`(`breast`);

-- CreateIndex
CREATE INDEX `video_franchise_idx` ON `video`(`franchise`);

-- CreateIndex
CREATE INDEX `video_brand_idx` ON `video`(`brand`);

-- CreateIndex
CREATE INDEX `video_noStar_idx` ON `video`(`noStar`);

-- CreateIndex
CREATE INDEX `video_height_duration_idx` ON `video`(`height`, `duration`);
