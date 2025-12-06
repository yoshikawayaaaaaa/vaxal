/*
  Warnings:

  - Added the required column `firstInquiryDate` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Project` ADD COLUMN `applicantRelationship` VARCHAR(191) NULL,
    ADD COLUMN `costPrice` INTEGER NULL,
    ADD COLUMN `firstInquiryDate` DATETIME(3) NOT NULL,
    ADD COLUMN `handMoneyAmount` INTEGER NULL,
    ADD COLUMN `hasHandMoney` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `productOtherNumber` VARCHAR(191) NULL,
    ADD COLUMN `sellingPrice` INTEGER NULL,
    ADD COLUMN `subsidyAmount` INTEGER NULL,
    ADD COLUMN `warrantyPeriod` ENUM('FIVE_YEARS', 'SEVEN_YEARS', 'TEN_YEARS') NULL;
