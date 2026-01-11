-- CreateTable
CREATE TABLE `companies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyNumber` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `establishedDate` DATETIME(3) NULL,
    `businessContent` VARCHAR(191) NULL,
    `capital` VARCHAR(191) NULL,
    `employeeCount` INTEGER NULL,
    `address` VARCHAR(191) NOT NULL,
    `revenue` VARCHAR(191) NULL,
    `representativeName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `faxNumber` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `majorClients` VARCHAR(191) NULL,
    `relatedCompanies` VARCHAR(191) NULL,
    `constructionLicense` BOOLEAN NOT NULL DEFAULT false,
    `registrationStatus` BOOLEAN NOT NULL DEFAULT false,
    `licenseStatus` BOOLEAN NOT NULL DEFAULT false,
    `qualificationStatus` BOOLEAN NOT NULL DEFAULT false,
    `insuranceName` VARCHAR(191) NULL,
    `insuranceNumber` VARCHAR(191) NULL,
    `coverageAmount` VARCHAR(191) NULL,
    `workersCompensation` BOOLEAN NOT NULL DEFAULT false,
    `invoiceNumber` VARCHAR(191) NULL,
    `businessHours` VARCHAR(191) NULL,
    `availableServices` TEXT NULL,
    `serviceExperience` JSON NULL,
    `constructionHistory` VARCHAR(191) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `companies_companyNumber_key`(`companyNumber`),
    UNIQUE INDEX `companies_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vaxal_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `accountType` ENUM('STAFF', 'CALL_CENTER') NOT NULL DEFAULT 'STAFF',
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `vaxal_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engineer_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
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
    `companyId` INTEGER NULL,
    `masterCompanyId` INTEGER NULL,
    `availableServices` TEXT NULL,
    `serviceExperience` JSON NULL,
    `hasLicense` BOOLEAN NOT NULL DEFAULT false,
    `hasQualification` BOOLEAN NOT NULL DEFAULT false,
    `hasWorkersComp` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `engineer_users_email_key`(`email`),
    UNIQUE INDEX `engineer_users_masterCompanyId_key`(`masterCompanyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectNumber` VARCHAR(191) NOT NULL,
    `siteName` VARCHAR(191) NOT NULL,
    `siteAddress` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerBirthDate` DATETIME(3) NOT NULL,
    `applicantRelationship` VARCHAR(191) NULL,
    `customerAddress` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `firstInquiryDate` DATETIME(3) NOT NULL,
    `workContent` ENUM('ECO_CUTE', 'GAS_WATER_HEATER', 'ELECTRIC_HEATER', 'BATHROOM_DRYER', 'SOLAR_PANEL', 'OTHER') NOT NULL,
    `workType` ENUM('NEW_INSTALLATION', 'REFORM', 'REPLACEMENT') NOT NULL,
    `workCategory` ENUM('MAIN_WORK', 'CORRECTION', 'SITE_SURVEY') NOT NULL,
    `workTime` VARCHAR(191) NOT NULL DEFAULT '09:00~17:00',
    `overview` VARCHAR(191) NULL,
    `productSetNumber` VARCHAR(191) NULL,
    `productTankNumber` VARCHAR(191) NULL,
    `productHeatPumpNumber` VARCHAR(191) NULL,
    `productRemoteNumber` VARCHAR(191) NULL,
    `productBaseNumber` VARCHAR(191) NULL,
    `productFallNumber` VARCHAR(191) NULL,
    `productUlbroNumber` VARCHAR(191) NULL,
    `productOtherNumber` VARCHAR(191) NULL,
    `paymentAmount` INTEGER NULL,
    `productWarranty` BOOLEAN NOT NULL DEFAULT false,
    `warrantyPeriod` ENUM('FIVE_YEARS', 'SEVEN_YEARS', 'TEN_YEARS') NULL,
    `paymentMethod` ENUM('CASH', 'CARD', 'LOAN', 'BANK_TRANSFER', 'ELECTRONIC_MONEY') NULL,
    `subsidyAmount` INTEGER NULL,
    `sellingPrices` JSON NULL,
    `costPrice` INTEGER NULL,
    `hasHandMoney` BOOLEAN NOT NULL DEFAULT false,
    `handMoneyAmount` INTEGER NULL,
    `idCardRequired` BOOLEAN NOT NULL DEFAULT false,
    `idCardObtained` BOOLEAN NOT NULL DEFAULT false,
    `bankbookRequired` BOOLEAN NOT NULL DEFAULT false,
    `bankbookObtained` BOOLEAN NOT NULL DEFAULT false,
    `additionalWork` VARCHAR(191) NULL,
    `existingProductInfo` VARCHAR(191) NULL,
    `constructionNotes` VARCHAR(191) NULL,
    `workDate` DATETIME(3) NULL,
    `receptionDate` DATETIME(3) NULL,
    `orderDate` DATETIME(3) NULL,
    `expectedCompletionDate` DATETIME(3) NULL,
    `completionDate` DATETIME(3) NULL,
    `firstContactMethod` ENUM('EMAIL', 'PHONE', 'INQUIRY_FORM', 'LINE', 'SNS', 'OTHER') NULL,
    `communicationTool` VARCHAR(191) NULL,
    `internalNotes` VARCHAR(191) NULL,
    `revisitType` ENUM('COMPLAINT', 'REPURCHASE', 'ANOTHER_CASE') NULL,
    `revisitDateTime` DATETIME(3) NULL,
    `revisitCount` INTEGER NULL,
    `crossSellContent` VARCHAR(191) NULL,
    `contractorName` VARCHAR(191) NULL,
    `contractorPhone` VARCHAR(191) NULL,
    `contractorNotes` VARCHAR(191) NULL,
    `receptionStaff` VARCHAR(191) NULL,
    `receptionStaffPhone` VARCHAR(191) NULL,
    `salesStaff` VARCHAR(191) NULL,
    `salesStaffPhone` VARCHAR(191) NULL,
    `constructionStaff` VARCHAR(191) NULL,
    `constructionStaffPhone` VARCHAR(191) NULL,
    `staffNotes` VARCHAR(191) NULL,
    `roofingDate` DATETIME(3) NULL,
    `demolitionDate` DATETIME(3) NULL,
    `buildingType` ENUM('MANSION', 'DETACHED_HOUSE', 'APARTMENT', 'OTHER') NULL,
    `installationFloor` VARCHAR(191) NULL,
    `installationLocation` VARCHAR(191) NULL,
    `keyboxNumber` VARCHAR(191) NULL,
    `storageLocation` VARCHAR(191) NULL,
    `parkingSpace` VARCHAR(191) NULL,
    `buildingNotes` VARCHAR(191) NULL,
    `productCategory` VARCHAR(191) NULL,
    `productSeries` VARCHAR(191) NULL,
    `deliveryDate` DATETIME(3) NULL,
    `shipmentDate` DATETIME(3) NULL,
    `productNotes` VARCHAR(191) NULL,
    `deliveryTime` VARCHAR(191) NULL,
    `deliverySpecification` VARCHAR(191) NULL,
    `deliveryLocation` VARCHAR(191) NULL,
    `deliveryNotes` VARCHAR(191) NULL,
    `surveyRequestDate` DATETIME(3) NULL,
    `surveyDate` DATETIME(3) NULL,
    `surveyTime` VARCHAR(191) NULL,
    `surveyCompany` VARCHAR(191) NULL,
    `surveyStaff` VARCHAR(191) NULL,
    `reSurveyDate` DATETIME(3) NULL,
    `surveyNotes` VARCHAR(191) NULL,
    `constructionDate` DATETIME(3) NULL,
    `constructionCompany` VARCHAR(191) NULL,
    `constructionStaffName` VARCHAR(191) NULL,
    `constructionEmail` VARCHAR(191) NULL,
    `constructionPhone` VARCHAR(191) NULL,
    `remainingWorkDate` DATETIME(3) NULL,
    `constructionInfoNotes` VARCHAR(191) NULL,
    `contractAmount` INTEGER NULL,
    `hasRemoteTravelFee` BOOLEAN NOT NULL DEFAULT false,
    `remoteTravelDistance` INTEGER NULL,
    `remoteTravelFee` INTEGER NULL,
    `status` ENUM('PENDING', 'ASSIGNED', 'REPORTED', 'COMPLETED', 'REMAINING_WORK') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    `createdByVaxalId` INTEGER NOT NULL,
    `companyId` INTEGER NULL,
    `assignedEngineerId` INTEGER NULL,

    UNIQUE INDEX `projects_projectNumber_key`(`projectNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectNumber` VARCHAR(191) NOT NULL,
    `constructionNotes` TEXT NULL,
    `contractorName` VARCHAR(191) NULL,
    `contractorPhone` VARCHAR(191) NULL,
    `contractorNotes` TEXT NULL,
    `receptionStaff` VARCHAR(191) NULL,
    `receptionStaffPhone` VARCHAR(191) NULL,
    `salesStaff` VARCHAR(191) NULL,
    `salesStaffPhone` VARCHAR(191) NULL,
    `constructionStaff` VARCHAR(191) NULL,
    `constructionStaffPhone` VARCHAR(191) NULL,
    `staffNotes` TEXT NULL,
    `roofingDate` DATETIME(3) NULL,
    `demolitionDate` DATETIME(3) NULL,
    `buildingType` ENUM('MANSION', 'DETACHED_HOUSE', 'APARTMENT', 'OTHER') NULL,
    `installationFloor` VARCHAR(191) NULL,
    `installationLocation` TEXT NULL,
    `keyboxNumber` VARCHAR(191) NULL,
    `storageLocation` VARCHAR(191) NULL,
    `parkingSpace` TEXT NULL,
    `buildingNotes` TEXT NULL,
    `productCategory` VARCHAR(191) NULL,
    `productSeries` VARCHAR(191) NULL,
    `deliveryDate` DATETIME(3) NULL,
    `shipmentDate` DATETIME(3) NULL,
    `productNotes` TEXT NULL,
    `deliveryTime` VARCHAR(191) NULL,
    `deliverySpecification` VARCHAR(191) NULL,
    `deliveryLocation` VARCHAR(191) NULL,
    `deliveryNotes` TEXT NULL,
    `surveyRequestDate` DATETIME(3) NULL,
    `surveyDate` DATETIME(3) NULL,
    `surveyTime` VARCHAR(191) NULL,
    `surveyCompany` VARCHAR(191) NULL,
    `surveyStaff` VARCHAR(191) NULL,
    `reSurveyDate` DATETIME(3) NULL,
    `surveyNotes` TEXT NULL,
    `constructionDate` DATETIME(3) NULL,
    `constructionCompany` VARCHAR(191) NULL,
    `constructionStaffName` VARCHAR(191) NULL,
    `constructionPhone` VARCHAR(191) NULL,
    `constructionEmail` VARCHAR(191) NULL,
    `remainingWorkDate` DATETIME(3) NULL,
    `constructionInfoNotes` TEXT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    `projectId` INTEGER NOT NULL,

    UNIQUE INDEX `main_info_projectNumber_key`(`projectNumber`),
    UNIQUE INDEX `main_info_projectId_key`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendar_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `eventType` ENUM('CONFIRMED', 'AVAILABLE') NOT NULL,
    `vaxalUserId` INTEGER NULL,
    `engineerUserId` INTEGER NULL,
    `projectId` INTEGER NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportType` ENUM('SITE_SURVEY', 'PICKUP', 'CHECK_IN', 'COMPLETION', 'UNLOADING') NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `notes` VARCHAR(191) NULL,
    `pickupMaterials` VARCHAR(191) NULL,
    `isWorkCompleted` BOOLEAN NULL,
    `remainingWorkDate` DATETIME(3) NULL,
    `existingManufacturer` VARCHAR(191) NULL,
    `yearsOfUse` INTEGER NULL,
    `replacementType` ENUM('ECO_TO_ECO', 'GAS_TO_ECO', 'ELECTRIC_TO_ECO', 'OTHER') NULL,
    `replacementManufacturer` VARCHAR(191) NULL,
    `tankCapacity` VARCHAR(191) NULL,
    `tankType` ENUM('THIN', 'SQUARE') NULL,
    `hasSpecialSpec` BOOLEAN NOT NULL DEFAULT false,
    `materialUnitPrice` INTEGER NULL,
    `highwayFee` INTEGER NULL,
    `gasolineFee` INTEGER NULL,
    `saleType` ENUM('ECO_CUTE', 'GAS_WATER_HEATER', 'ELECTRIC_HEATER', 'OTHER') NULL,
    `saleFee` INTEGER NULL,
    `projectId` INTEGER NOT NULL,
    `engineerUserId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `category` ENUM('SITE_FOLDER', 'ARRANGEMENT_FOLDER', 'SURVEY_REPORT', 'PICKUP_REPORT', 'CHECKIN_REPORT', 'COMPLETION_REPORT', 'UNLOADING_REPORT', 'APPEARANCE_PHOTO', 'BEFORE_WORK_PHOTO', 'SUBSIDY_PHOTO', 'REGULATION_PHOTO', 'FREE_PHOTO') NOT NULL,
    `projectId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `reportId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monthly_expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `wasteDisposalFee` INTEGER NULL,
    `vehicleFee` INTEGER NULL,
    `laborCost` INTEGER NULL,
    `warehouseFee` INTEGER NULL,
    `officeFee` INTEGER NULL,
    `communicationFee` INTEGER NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `monthly_expenses_year_month_key`(`year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `partNumber` VARCHAR(191) NULL,
    `unitPrice` INTEGER NOT NULL,
    `unitType` ENUM('PIECE', 'METER') NOT NULL DEFAULT 'PIECE',
    `currentStock` INTEGER NOT NULL DEFAULT 0,
    `threshold` INTEGER NOT NULL DEFAULT 0,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_price_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventoryItemId` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `effectiveFrom` DATETIME(3) NOT NULL,
    `effectiveTo` DATETIME(3) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    INDEX `inventory_price_history_inventoryItemId_idx`(`inventoryItemId`),
    INDEX `inventory_price_history_effectiveFrom_idx`(`effectiveFrom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `selling_price_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `selling_price_types_name_key`(`name`),
    INDEX `selling_price_types_displayOrder_idx`(`displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pickup_materials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `inventoryItemId` INTEGER NOT NULL,
    `inventoryItemName` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `partNumber` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `unitType` ENUM('PIECE', 'METER') NOT NULL,
    `unitPrice` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    INDEX `pickup_materials_reportId_idx`(`reportId`),
    INDEX `pickup_materials_inventoryItemId_idx`(`inventoryItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('REPORT_SUBMITTED', 'ORDER_RECEIVED', 'PROJECT_ASSIGNED', 'PROJECT_COMPLETED', 'INVENTORY_LOW_STOCK', 'INVENTORY_OUT_OF_STOCK') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `projectId` INTEGER NULL,
    `vaxalUserId` INTEGER NULL,
    `engineerUserId` INTEGER NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    INDEX `notifications_vaxalUserId_isRead_idx`(`vaxalUserId`, `isRead`),
    INDEX `notifications_engineerUserId_isRead_idx`(`engineerUserId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `engineer_users` ADD CONSTRAINT `engineer_users_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engineer_users` ADD CONSTRAINT `engineer_users_masterCompanyId_fkey` FOREIGN KEY (`masterCompanyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_createdByVaxalId_fkey` FOREIGN KEY (`createdByVaxalId`) REFERENCES `vaxal_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_assignedEngineerId_fkey` FOREIGN KEY (`assignedEngineerId`) REFERENCES `engineer_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `main_info` ADD CONSTRAINT `main_info_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_vaxalUserId_fkey` FOREIGN KEY (`vaxalUserId`) REFERENCES `vaxal_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_engineerUserId_fkey` FOREIGN KEY (`engineerUserId`) REFERENCES `engineer_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_engineerUserId_fkey` FOREIGN KEY (`engineerUserId`) REFERENCES `engineer_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_files` ADD CONSTRAINT `report_files_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_price_history` ADD CONSTRAINT `inventory_price_history_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `inventory_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pickup_materials` ADD CONSTRAINT `pickup_materials_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pickup_materials` ADD CONSTRAINT `pickup_materials_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_vaxalUserId_fkey` FOREIGN KEY (`vaxalUserId`) REFERENCES `vaxal_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_engineerUserId_fkey` FOREIGN KEY (`engineerUserId`) REFERENCES `engineer_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
