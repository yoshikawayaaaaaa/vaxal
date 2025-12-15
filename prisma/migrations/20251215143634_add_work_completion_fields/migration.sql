-- AlterTable
ALTER TABLE `Report` ADD COLUMN `isWorkCompleted` BOOLEAN NULL,
    ADD COLUMN `remainingWorkDate` DATETIME(3) NULL;
