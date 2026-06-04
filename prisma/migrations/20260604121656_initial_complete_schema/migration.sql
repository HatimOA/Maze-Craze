-- CreateTable
CREATE TABLE `player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `successful_attempts` INTEGER NOT NULL DEFAULT 0,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationToken` VARCHAR(255) NULL,
    `verificationExpires` DATETIME(3) NULL,

    UNIQUE INDEX `player_email_key`(`email`),
    UNIQUE INDEX `player_verificationToken_key`(`verificationToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
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

    INDEX `state_player_id_fkey`(`player_id`),
    PRIMARY KEY (`state_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actions` (
    `action_id` INTEGER NOT NULL AUTO_INCREMENT,
    `agents_behavior` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`action_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rewards` (
    `reward_id` INTEGER NOT NULL AUTO_INCREMENT,
    `state_id` VARCHAR(191) NOT NULL,
    `action_id` INTEGER NOT NULL,
    `value` INTEGER NOT NULL,

    INDEX `rewards_action_id_fkey`(`action_id`),
    UNIQUE INDEX `rewards_state_action_key`(`state_id`, `action_id`),
    PRIMARY KEY (`reward_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `keyword` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `keyword_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `state_recommendation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `state_id` VARCHAR(191) NOT NULL,
    `player_id` INTEGER NOT NULL,

    UNIQUE INDEX `state_recommendation_state_id_player_id_key`(`state_id`, `player_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendation` (
    `recommendation_id` VARCHAR(191) NOT NULL,
    `state_id` VARCHAR(191) NOT NULL,
    `recommended_action` VARCHAR(50) NOT NULL,
    `confidence` DOUBLE NOT NULL,
    `model_version` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `recommendation_state_id_idx`(`state_id`),
    PRIMARY KEY (`recommendation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `state_keyword` (
    `state_id` VARCHAR(191) NOT NULL,
    `keyword_id` INTEGER NOT NULL,
    `player_id` INTEGER NOT NULL,

    INDEX `state_keyword_player_id_idx`(`player_id`),
    PRIMARY KEY (`state_id`, `keyword_id`, `player_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_sample` (
    `sample_id` VARCHAR(191) NOT NULL,
    `state_id` VARCHAR(191) NOT NULL,
    `player_id` INTEGER NOT NULL,
    `p1_x` INTEGER NOT NULL,
    `p1_y` INTEGER NOT NULL,
    `p2_x` INTEGER NOT NULL,
    `p2_y` INTEGER NOT NULL,
    `r_x` INTEGER NOT NULL,
    `r_y` INTEGER NOT NULL,
    `best_action` VARCHAR(50) NOT NULL,
    `reward` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `training_sample_state_id_idx`(`state_id`),
    INDEX `training_sample_player_id_idx`(`player_id`),
    PRIMARY KEY (`sample_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `state` ADD CONSTRAINT `state_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rewards` ADD CONSTRAINT `rewards_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `state`(`state_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rewards` ADD CONSTRAINT `rewards_action_id_fkey` FOREIGN KEY (`action_id`) REFERENCES `actions`(`action_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `state_recommendation` ADD CONSTRAINT `state_recommendation_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `state`(`state_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `state_recommendation` ADD CONSTRAINT `state_recommendation_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation` ADD CONSTRAINT `recommendation_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `state`(`state_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `state_keyword` ADD CONSTRAINT `state_keyword_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `state`(`state_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `state_keyword` ADD CONSTRAINT `state_keyword_keyword_id_fkey` FOREIGN KEY (`keyword_id`) REFERENCES `keyword`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `state_keyword` ADD CONSTRAINT `state_keyword_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_sample` ADD CONSTRAINT `training_sample_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `state`(`state_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_sample` ADD CONSTRAINT `training_sample_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
