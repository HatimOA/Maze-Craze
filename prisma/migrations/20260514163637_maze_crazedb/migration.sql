/*
  Warnings:

  - The primary key for the `state_keywords` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `rewards` DROP FOREIGN KEY `rewards_action_id_fkey`;

-- DropForeignKey
ALTER TABLE `rewards` DROP FOREIGN KEY `rewards_state_id_fkey`;

-- DropForeignKey
ALTER TABLE `state` DROP FOREIGN KEY `state_player_id_fkey`;

-- DropForeignKey
ALTER TABLE `state_keywords` DROP FOREIGN KEY `state_keywords_keyword_fkey`;

-- DropForeignKey
ALTER TABLE `state_keywords` DROP FOREIGN KEY `state_keywords_state_fkey`;

-- AlterTable
ALTER TABLE `rewards` MODIFY `state_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `state_keywords` DROP PRIMARY KEY,
    MODIFY `state_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`state_id`, `keyword_id`);

-- AddForeignKey
ALTER TABLE `state` ADD CONSTRAINT `state_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rewards` ADD CONSTRAINT `rewards_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `state`(`state_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rewards` ADD CONSTRAINT `rewards_action_id_fkey` FOREIGN KEY (`action_id`) REFERENCES `actions`(`action_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `state_keywords` ADD CONSTRAINT `state_keywords_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `state`(`state_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `state_keywords` ADD CONSTRAINT `state_keywords_keyword_id_fkey` FOREIGN KEY (`keyword_id`) REFERENCES `keyword`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
