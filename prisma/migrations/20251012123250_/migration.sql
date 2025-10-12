-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
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
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Company_companyNumber_key`(`companyNumber`),
    UNIQUE INDEX `Company_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('VAXAL_ADMIN', 'ENGINEER_MASTER', 'ENGINEER_STAFF') NOT NULL,
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

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_masterCompanyId_key`(`masterCompanyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `projectNumber` VARCHAR(191) NOT NULL,
    `siteName` VARCHAR(191) NOT NULL,
    `siteAddress` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerAddress` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
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
    `paymentAmount` INTEGER NULL,
    `productWarranty` BOOLEAN NOT NULL DEFAULT false,
    `paymentMethod` ENUM('CASH', 'CARD', 'LOAN', 'BANK_TRANSFER', 'ELECTRONIC_MONEY') NULL,
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
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NULL,
    `assignedEngineerId` VARCHAR(191) NULL,

    UNIQUE INDEX `Project_projectNumber_key`(`projectNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CalendarEvent` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `eventType` ENUM('CONFIRMED', 'AVAILABLE') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `reportType` ENUM('SITE_SURVEY', 'PICKUP', 'CHECK_IN', 'COMPLETION', 'UNLOADING') NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `notes` VARCHAR(191) NULL,
    `pickupMaterials` VARCHAR(191) NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectFile` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `category` ENUM('SITE_FOLDER', 'ARRANGEMENT_FOLDER', 'SURVEY_REPORT', 'PICKUP_REPORT', 'CHECKIN_REPORT', 'COMPLETION_REPORT', 'UNLOADING_REPORT', 'APPEARANCE_PHOTO', 'BEFORE_WORK_PHOTO', 'SUBSIDY_PHOTO', 'REGULATION_PHOTO', 'FREE_PHOTO') NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportFile` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_masterCompanyId_fkey` FOREIGN KEY (`masterCompanyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_assignedEngineerId_fkey` FOREIGN KEY (`assignedEngineerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEvent` ADD CONSTRAINT `CalendarEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEvent` ADD CONSTRAINT `CalendarEvent_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectFile` ADD CONSTRAINT `ProjectFile_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportFile` ADD CONSTRAINT `ReportFile_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
