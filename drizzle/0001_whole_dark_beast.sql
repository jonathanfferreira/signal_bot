CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`name` text NOT NULL,
	`category` enum('forex','crypto','stock') NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `assets_symbol_unique` UNIQUE(`symbol`)
);
--> statement-breakpoint
CREATE TABLE `signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assetId` int NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`direction` enum('CALL','PUT','ESPERAR') NOT NULL,
	`strength` int NOT NULL,
	`interval` varchar(16) NOT NULL,
	`emaSignal` varchar(16),
	`rsiSignal` varchar(16),
	`bbandsSignal` varchar(16),
	`macdSignal` varchar(16),
	`longTermTrend` varchar(16),
	`closePrice` text,
	`ema9` text,
	`ema21` text,
	`rsi` text,
	`macdHist` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assetId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`analysisInterval` varchar(16) NOT NULL DEFAULT '5m',
	`longTermInterval` varchar(16) NOT NULL DEFAULT '1h',
	`minConfluencePoints` int NOT NULL DEFAULT 3,
	`telegramEnabled` int NOT NULL DEFAULT 0,
	`telegramBotToken` text,
	`telegramChatId` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSettings_id` PRIMARY KEY(`id`)
);
