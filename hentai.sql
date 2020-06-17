SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `attributes` (
                              `id` int(11) NOT NULL,
                              `name` varchar(255) NOT NULL,
                              `videoOnly` tinyint(1) NOT NULL DEFAULT 0,
                              `starOnly` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `bookmarkattributes` (
                                      `id` int(11) NOT NULL,
                                      `bookmarkID` int(11) NOT NULL,
                                      `attributeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `bookmarks` (
                             `id` int(11) NOT NULL,
                             `videoID` int(11) NOT NULL,
                             `categoryID` int(11) NOT NULL,
                             `start` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `bookmarkstars` (
                                 `id` int(11) NOT NULL,
                                 `bookmarkID` int(11) NOT NULL,
                                 `starID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `categories` (
                              `id` int(11) NOT NULL,
                              `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `plays` (
                         `id` int(11) NOT NULL,
                         `videoID` int(11) NOT NULL,
                         `time` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

CREATE TABLE `settings` (
                            `id` int(11) NOT NULL,
                            `cdn` tinyint(1) NOT NULL DEFAULT 0,
                            `cdn_max` tinyint(1) NOT NULL DEFAULT 2,
                            `thumbnail_res` int(11) NOT NULL DEFAULT 290,
                            `thumbnail_start` int(11) NOT NULL DEFAULT 100,
                            `enable_webm` tinyint(1) NOT NULL DEFAULT 0,
                            `enable_mkv` tinyint(1) NOT NULL DEFAULT 0,
                            `enable_fa` tinyint(1) NOT NULL DEFAULT 0,
                            `video_sql` varchar(255) DEFAULT NULL,
                            `enable_dash` tinyint(1) NOT NULL DEFAULT 0,
                            `enable_hls` tinyint(1) NOT NULL DEFAULT 0,
                            `enable_https` tinyint(1) NOT NULL DEFAULT 0,
                            `script_reload` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

INSERT INTO `settings` (`id`, `cdn`, `cdn_max`, `thumbnail_res`, `thumbnail_start`, `enable_webm`, `enable_mkv`, `enable_fa`, `video_sql`, `enable_dash`, `enable_hls`, `enable_https`, `script_reload`) VALUES
(1, 0, 0, 290, 100, 0, 0, 1, NULL, 0, 1, 1, 0);

CREATE TABLE `starattributes` (
                                  `id` int(11) NOT NULL,
                                  `starID` int(11) NOT NULL,
                                  `attributeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `starrelations` (
                                 `id` int(11) NOT NULL,
                                 `starID` int(11) NOT NULL,
                                 `otherstarID` int(11) NOT NULL,
                                 `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `stars` (
                         `id` int(11) NOT NULL,
                         `name` varchar(255) NOT NULL,
                         `image` varchar(255) DEFAULT NULL,
                         `haircolor` varchar(255) DEFAULT NULL,
                         `hairstyle` varchar(255) DEFAULT NULL,
                         `eyecolor` varchar(255) DEFAULT NULL,
                         `breast` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `videoalias` (
                              `id` int(11) NOT NULL,
                              `videoID` int(11) NOT NULL,
                              `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `videocategories` (
                                   `id` int(11) NOT NULL,
                                   `videoID` int(11) NOT NULL,
                                   `categoryID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `videos` (
                          `id` int(11) NOT NULL,
                          `name` varchar(255) NOT NULL,
                          `episode` float NOT NULL DEFAULT 0,
                          `path` varchar(255) NOT NULL,
                          `franchise` varchar(255) NOT NULL,
                          `noStar` tinyint(1) NOT NULL DEFAULT 0,
                          `height` int(11) NOT NULL DEFAULT 0,
                          `duration` int(11) NOT NULL DEFAULT 0,
                          `date` date NOT NULL,
                          `date_published` date DEFAULT NULL,
                          `cen` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `videostars` (
                              `id` int(11) NOT NULL,
                              `starID` int(11) NOT NULL,
                              `videoID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `attributes`
    ADD PRIMARY KEY (`id`),
    ADD KEY `name` (`name`),
    ADD KEY `videoOnly` (`videoOnly`);

ALTER TABLE `bookmarkattributes`
    ADD PRIMARY KEY (`id`),
    ADD KEY `attributeID` (`attributeID`),
    ADD KEY `bookmarkID` (`bookmarkID`) USING BTREE;

ALTER TABLE `bookmarks`
    ADD PRIMARY KEY (`id`),
    ADD KEY `videoID` (`videoID`),
    ADD KEY `start` (`start`),
    ADD KEY `categoryID` (`categoryID`);

ALTER TABLE `bookmarkstars`
    ADD PRIMARY KEY (`id`),
    ADD UNIQUE KEY `bookmarkID` (`bookmarkID`),
    ADD KEY `starID` (`starID`);

ALTER TABLE `categories`
    ADD PRIMARY KEY (`id`),
    ADD UNIQUE KEY `name` (`name`);

ALTER TABLE `plays`
    ADD PRIMARY KEY (`id`),
    ADD UNIQUE KEY `time` (`time`),
    ADD KEY `videoID` (`videoID`);

ALTER TABLE `settings`
    ADD PRIMARY KEY (`id`);

ALTER TABLE `starattributes`
    ADD PRIMARY KEY (`id`),
    ADD KEY `attributeID` (`attributeID`),
    ADD KEY `starID` (`starID`);

ALTER TABLE `starrelations`
    ADD PRIMARY KEY (`id`),
    ADD KEY `starID` (`starID`),
    ADD KEY `otherstarID` (`otherstarID`),
    ADD KEY `name` (`name`);

ALTER TABLE `stars`
    ADD PRIMARY KEY (`id`),
    ADD UNIQUE KEY `name` (`name`) USING BTREE,
    ADD UNIQUE KEY `image` (`image`),
    ADD KEY `breast` (`breast`),
    ADD KEY `hairstyle` (`hairstyle`),
    ADD KEY `haircolor` (`haircolor`) USING BTREE,
    ADD KEY `eyecolor` (`eyecolor`) USING BTREE;

ALTER TABLE `videoalias`
    ADD PRIMARY KEY (`id`),
    ADD KEY `videoID` (`videoID`),
    ADD KEY `name` (`name`);

ALTER TABLE `videocategories`
    ADD PRIMARY KEY (`id`),
    ADD KEY `videoID` (`videoID`),
    ADD KEY `categoryID` (`categoryID`);

ALTER TABLE `videos`
    ADD PRIMARY KEY (`id`),
    ADD UNIQUE KEY `path` (`path`),
    ADD KEY `franchise` (`franchise`),
    ADD KEY `name` (`name`),
    ADD KEY `episode` (`episode`),
    ADD KEY `noStar` (`noStar`),
    ADD KEY `height` (`height`),
    ADD KEY `duration` (`duration`),
    ADD KEY `cen` (`cen`),
    ADD KEY `date` (`date`) USING BTREE,
    ADD KEY `date_published` (`date_published`);

ALTER TABLE `videostars`
    ADD PRIMARY KEY (`id`),
    ADD KEY `starID` (`starID`),
    ADD KEY `videoID` (`videoID`);


ALTER TABLE `attributes`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `bookmarkattributes`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `bookmarks`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `bookmarkstars`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `categories`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `plays`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `settings`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `starattributes`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `starrelations`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `stars`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `videoalias`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `videocategories`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `videos`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `videostars`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
