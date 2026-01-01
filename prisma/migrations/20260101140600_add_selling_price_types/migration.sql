-- CreateTable
CREATE TABLE `SellingPriceType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SellingPriceType_name_key`(`name`),
    INDEX `SellingPriceType_displayOrder_idx`(`displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Project` 
    DROP COLUMN `sellingPrice`,
    DROP COLUMN `sellingPrice2`,
    DROP COLUMN `sellingPrice3`,
    ADD COLUMN `sellingPrices` JSON NULL;

-- Insert default selling price types
INSERT INTO `SellingPriceType` (`id`, `name`, `displayOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
    (UUID(), '交換できるくん', 1, true, NOW(), NOW()),
    (UUID(), 'キンライサー', 2, true, NOW(), NOW()),
    (UUID(), 'cools', 3, true, NOW(), NOW());
