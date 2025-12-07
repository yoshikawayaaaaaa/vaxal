/*
  Warnings:

  - You are about to drop the column `existingManufacturer` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `gasolineFee` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `hasSpecialSpec` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `highwayFee` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `materialUnitPrice` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `replacementManufacturer` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `replacementType` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `tankCapacity` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `tankType` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `yearsOfUse` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Project` DROP COLUMN `existingManufacturer`,
    DROP COLUMN `gasolineFee`,
    DROP COLUMN `hasSpecialSpec`,
    DROP COLUMN `highwayFee`,
    DROP COLUMN `materialUnitPrice`,
    DROP COLUMN `replacementManufacturer`,
    DROP COLUMN `replacementType`,
    DROP COLUMN `tankCapacity`,
    DROP COLUMN `tankType`,
    DROP COLUMN `yearsOfUse`;

-- AlterTable
ALTER TABLE `Report` ADD COLUMN `existingManufacturer` VARCHAR(191) NULL,
    ADD COLUMN `gasolineFee` INTEGER NULL,
    ADD COLUMN `hasSpecialSpec` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `highwayFee` INTEGER NULL,
    ADD COLUMN `materialUnitPrice` INTEGER NULL,
    ADD COLUMN `replacementManufacturer` VARCHAR(191) NULL,
    ADD COLUMN `replacementType` ENUM('ECO_TO_ECO', 'GAS_TO_ECO', 'ELECTRIC_TO_ECO', 'OTHER') NULL,
    ADD COLUMN `tankCapacity` VARCHAR(191) NULL,
    ADD COLUMN `tankType` ENUM('THIN', 'SQUARE') NULL,
    ADD COLUMN `yearsOfUse` INTEGER NULL;
