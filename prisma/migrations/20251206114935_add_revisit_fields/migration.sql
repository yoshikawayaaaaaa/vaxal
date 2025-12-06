-- AlterTable
ALTER TABLE `Project` ADD COLUMN `crossSellContent` VARCHAR(191) NULL,
    ADD COLUMN `revisitCount` INTEGER NULL,
    ADD COLUMN `revisitDateTime` DATETIME(3) NULL,
    ADD COLUMN `revisitType` ENUM('COMPLAINT', 'REPURCHASE', 'ANOTHER_CASE') NULL;
