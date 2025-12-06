-- AlterTable
ALTER TABLE `Project` ADD COLUMN `existingManufacturer` VARCHAR(191) NULL,
    ADD COLUMN `gasolineFee` INTEGER NULL,
    ADD COLUMN `hasSpecialSpec` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `highwayFee` INTEGER NULL,
    ADD COLUMN `materialUnitPrice` INTEGER NULL,
    ADD COLUMN `replacementManufacturer` VARCHAR(191) NULL,
    ADD COLUMN `replacementType` ENUM('ECO_TO_ECO', 'GAS_TO_ECO', 'ELECTRIC_TO_ECO', 'OTHER') NULL,
    ADD COLUMN `tankCapacity` VARCHAR(191) NULL,
    ADD COLUMN `tankType` ENUM('THIN', 'SQUARE') NULL,
    ADD COLUMN `yearsOfUse` INTEGER NULL;
