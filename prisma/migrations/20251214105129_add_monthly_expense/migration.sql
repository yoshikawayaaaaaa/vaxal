-- CreateTable
CREATE TABLE `MonthlyExpense` (
    `id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `wasteDisposalFee` INTEGER NULL,
    `vehicleFee` INTEGER NULL,
    `laborCost` INTEGER NULL,
    `warehouseFee` INTEGER NULL,
    `officeFee` INTEGER NULL,
    `communicationFee` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MonthlyExpense_year_month_key`(`year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
