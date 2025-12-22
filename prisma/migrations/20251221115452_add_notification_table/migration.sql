-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('REPORT_SUBMITTED', 'ORDER_RECEIVED', 'PROJECT_ASSIGNED', 'PROJECT_COMPLETED') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `projectId` VARCHAR(191) NULL,
    `vaxalUserId` VARCHAR(191) NULL,
    `engineerUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notification_vaxalUserId_isRead_idx`(`vaxalUserId`, `isRead`),
    INDEX `Notification_engineerUserId_isRead_idx`(`engineerUserId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_vaxalUserId_fkey` FOREIGN KEY (`vaxalUserId`) REFERENCES `VaxalUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_engineerUserId_fkey` FOREIGN KEY (`engineerUserId`) REFERENCES `EngineerUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
