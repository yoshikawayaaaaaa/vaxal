-- CreateTable
CREATE TABLE `PickupMaterial` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `inventoryItemId` VARCHAR(191) NOT NULL,
    `inventoryItemName` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `partNumber` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `unitType` ENUM('PIECE', 'METER') NOT NULL,
    `unitPrice` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PickupMaterial_reportId_idx`(`reportId`),
    INDEX `PickupMaterial_inventoryItemId_idx`(`inventoryItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PickupMaterial` ADD CONSTRAINT `PickupMaterial_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PickupMaterial` ADD CONSTRAINT `PickupMaterial_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
