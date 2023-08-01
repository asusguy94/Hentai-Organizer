-- CreateTable
CREATE TABLE `attribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `videoOnly` BOOLEAN NOT NULL DEFAULT false,
    `starOnly` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `attribute_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookmarkattributes` (
    `attributeID` INTEGER NOT NULL,
    `bookmarkID` INTEGER NOT NULL,

    PRIMARY KEY (`attributeID`, `bookmarkID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookmark` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start` INTEGER NOT NULL DEFAULT 0,
    `videoID` INTEGER NOT NULL,
    `categoryID` INTEGER NOT NULL,
    `starID` INTEGER NULL,
    `outfitID` INTEGER NULL,

    UNIQUE INDEX `bookmark_videoID_start_key`(`videoID`, `start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outfit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `outfit_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `videoID` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `starattributes` (
    `attributeID` INTEGER NOT NULL,
    `starID` INTEGER NOT NULL,

    PRIMARY KEY (`attributeID`, `starID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `star` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `haircolor` VARCHAR(191) NULL,
    `breast` VARCHAR(191) NULL,
    `hairstyle` VARCHAR(191) NULL,
    `starLink` VARCHAR(191) NULL,

    UNIQUE INDEX `star_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `videostars` (
    `starID` INTEGER NOT NULL,
    `videoID` INTEGER NOT NULL,

    PRIMARY KEY (`starID`, `videoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `video` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `episode` INTEGER NOT NULL DEFAULT 0,
    `path` VARCHAR(191) NOT NULL,
    `franchise` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NULL,
    `noStar` BOOLEAN NOT NULL DEFAULT false,
    `height` INTEGER NOT NULL DEFAULT 0,
    `duration` INTEGER NOT NULL DEFAULT 0,
    `cen` BOOLEAN NOT NULL DEFAULT true,
    `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_published` DATE NULL,
    `cover` VARCHAR(191) NULL,

    UNIQUE INDEX `video_name_key`(`name`),
    UNIQUE INDEX `video_path_key`(`path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookmarkattributes` ADD CONSTRAINT `bookmarkattributes_attributeID_fkey` FOREIGN KEY (`attributeID`) REFERENCES `attribute`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarkattributes` ADD CONSTRAINT `bookmarkattributes_bookmarkID_fkey` FOREIGN KEY (`bookmarkID`) REFERENCES `bookmark`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_videoID_fkey` FOREIGN KEY (`videoID`) REFERENCES `video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_categoryID_fkey` FOREIGN KEY (`categoryID`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_starID_fkey` FOREIGN KEY (`starID`) REFERENCES `star`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_outfitID_fkey` FOREIGN KEY (`outfitID`) REFERENCES `outfit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plays` ADD CONSTRAINT `plays_videoID_fkey` FOREIGN KEY (`videoID`) REFERENCES `video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `starattributes` ADD CONSTRAINT `starattributes_starID_fkey` FOREIGN KEY (`starID`) REFERENCES `star`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `starattributes` ADD CONSTRAINT `starattributes_attributeID_fkey` FOREIGN KEY (`attributeID`) REFERENCES `attribute`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `videostars` ADD CONSTRAINT `videostars_starID_fkey` FOREIGN KEY (`starID`) REFERENCES `star`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `videostars` ADD CONSTRAINT `videostars_videoID_fkey` FOREIGN KEY (`videoID`) REFERENCES `video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
