/*
  Warnings:

  - The values [IN_PROGRESS,CANCELLED] on the enum `Project_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `InventoryItem` ADD COLUMN `displayOrder` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Project` MODIFY `status` ENUM('PENDING', 'ASSIGNED', 'REPORTED', 'COMPLETED', 'REMAINING_WORK') NOT NULL DEFAULT 'PENDING';
