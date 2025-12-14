-- AlterTable
ALTER TABLE `Project` ADD COLUMN `hasRemoteTravelFee` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `remoteTravelDistance` INTEGER NULL,
    ADD COLUMN `remoteTravelFee` INTEGER NULL;
