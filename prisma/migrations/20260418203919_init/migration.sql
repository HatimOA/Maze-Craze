-- CreateTable
CREATE TABLE `state` (
    `state_id` CHAR(32) NOT NULL,
    `p1_x` INTEGER NOT NULL,
    `p1_y` INTEGER NOT NULL,
    `p2_x` INTEGER NOT NULL,
    `p2_y` INTEGER NOT NULL,
    `r_x` INTEGER NOT NULL,
    `r_y` INTEGER NOT NULL,
    `robbers_left` INTEGER NOT NULL,

    PRIMARY KEY (`state_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actions` (
    `action_id` INTEGER NOT NULL,
    `agents_behavior` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`action_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rewards` (
    `reward_id` INTEGER NOT NULL AUTO_INCREMENT,
    `state_id` VARCHAR(191) NOT NULL,
    `action_id` INTEGER NOT NULL,
    `value` INTEGER NOT NULL,

    PRIMARY KEY (`reward_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rewards` ADD CONSTRAINT `rewards_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `state`(`state_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rewards` ADD CONSTRAINT `rewards_action_id_fkey` FOREIGN KEY (`action_id`) REFERENCES `actions`(`action_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
