-- =========================
-- PLAYER
-- =========================
CREATE TABLE `player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `player_email_key` (`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================
-- STATE
-- =========================
CREATE TABLE `state` (
    `state_id` CHAR(32) NOT NULL,
    `player_id` INTEGER NOT NULL,

    `p1_x` INTEGER NOT NULL,
    `p1_y` INTEGER NOT NULL,
    `p2_x` INTEGER NOT NULL,
    `p2_y` INTEGER NOT NULL,
    `r_x` INTEGER NOT NULL,
    `r_y` INTEGER NOT NULL,

    `robbers_left` INTEGER NOT NULL,
    `visibility` INTEGER NOT NULL DEFAULT 0,
    `imageUrl` TEXT NULL,

    PRIMARY KEY (`state_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================
-- ACTIONS
-- =========================
CREATE TABLE `actions` (
    `action_id` INTEGER NOT NULL AUTO_INCREMENT,
    `agents_behavior` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`action_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================
-- REWARDS
-- =========================
CREATE TABLE `rewards` (
    `reward_id` INTEGER NOT NULL AUTO_INCREMENT,
    `state_id` CHAR(32) NOT NULL,
    `action_id` INTEGER NOT NULL,
    `value` INTEGER NOT NULL,

    UNIQUE INDEX `rewards_state_action_key` (`state_id`, `action_id`),

    PRIMARY KEY (`reward_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================
-- KEYWORDS (NEW)
-- =========================
CREATE TABLE `keyword` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `keyword_name_key` (`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================
-- STATE ↔ KEYWORD (MANY TO MANY)
-- =========================
CREATE TABLE `state_keywords` (
    `state_id` CHAR(32) NOT NULL,
    `keyword_id` INTEGER NOT NULL,

    PRIMARY KEY (`state_id`, `keyword_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================
-- FOREIGN KEYS
-- =========================

ALTER TABLE `state`
ADD CONSTRAINT `state_player_id_fkey`
FOREIGN KEY (`player_id`) REFERENCES `player`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `rewards`
ADD CONSTRAINT `rewards_state_id_fkey`
FOREIGN KEY (`state_id`) REFERENCES `state`(`state_id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `rewards`
ADD CONSTRAINT `rewards_action_id_fkey`
FOREIGN KEY (`action_id`) REFERENCES `actions`(`action_id`)
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `state_keywords`
ADD CONSTRAINT `state_keywords_state_fkey`
FOREIGN KEY (`state_id`) REFERENCES `state`(`state_id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `state_keywords`
ADD CONSTRAINT `state_keywords_keyword_fkey`
FOREIGN KEY (`keyword_id`) REFERENCES `keyword`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;