/*
  Warnings:

  - You are about to drop the column `userId` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdByVaxalId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerBirthDate` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engineerUserId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CalendarEvent` DROP FOREIGN KEY `CalendarEvent_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Project` DROP FOREIGN KEY `Project_assignedEngineerId_fkey`;

-- DropForeignKey
ALTER TABLE `Project` DROP FOREIGN KEY `Project_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_userId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_masterCompanyId_fkey`;

-- DropIndex
DROP INDEX `CalendarEvent_userId_fkey` ON `CalendarEvent`;

-- DropIndex
DROP INDEX `Project_assignedEngineerId_fkey` ON `Project`;

-- DropIndex
DROP INDEX `Project_createdById_fkey` ON `Project`;

-- DropIndex
DROP INDEX `Report_userId_fkey` ON `Report`;

-- AlterTable
ALTER TABLE `CalendarEvent` DROP COLUMN `userId`,
    ADD COLUMN `engineerUserId` VARCHAR(191) NULL,
    ADD COLUMN `vaxalUserId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Project` DROP COLUMN `createdById`,
    ADD COLUMN `createdByVaxalId` VARCHAR(191) NOT NULL,
    ADD COLUMN `customerBirthDate` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Report` DROP COLUMN `userId`,
    ADD COLUMN `engineerUserId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `VaxalUser` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VaxalUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EngineerUser` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('MASTER', 'STAFF') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `bloodType` ENUM('A', 'B', 'O', 'AB', 'UNKNOWN') NULL,
    `birthDate` DATETIME(3) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `emergencyContact` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NULL,
    `masterCompanyId` VARCHAR(191) NULL,
    `availableServices` TEXT NULL,
    `serviceExperience` JSON NULL,
    `hasLicense` BOOLEAN NOT NULL DEFAULT false,
    `hasQualification` BOOLEAN NOT NULL DEFAULT false,
    `hasWorkersComp` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EngineerUser_email_key`(`email`),
    UNIQUE INDEX `EngineerUser_masterCompanyId_key`(`masterCompanyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EngineerUser` ADD CONSTRAINT `EngineerUser_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EngineerUser` ADD CONSTRAINT `EngineerUser_masterCompanyId_fkey` FOREIGN KEY (`masterCompanyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_createdByVaxalId_fkey` FOREIGN KEY (`createdByVaxalId`) REFERENCES `VaxalUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_assignedEngineerId_fkey` FOREIGN KEY (`assignedEngineerId`) REFERENCES `EngineerUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEvent` ADD CONSTRAINT `CalendarEvent_vaxalUserId_fkey` FOREIGN KEY (`vaxalUserId`) REFERENCES `VaxalUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEvent` ADD CONSTRAINT `CalendarEvent_engineerUserId_fkey` FOREIGN KEY (`engineerUserId`) REFERENCES `EngineerUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_engineerUserId_fkey` FOREIGN KEY (`engineerUserId`) REFERENCES `EngineerUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
