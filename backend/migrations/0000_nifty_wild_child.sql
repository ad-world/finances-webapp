CREATE TABLE `headerMapping` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`unmappedHeaders` text NOT NULL,
	`mappedHeaders` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `headerMapping_unmappedHeaders_unique` ON `headerMapping` (`unmappedHeaders`);--> statement-breakpoint
CREATE INDEX `unmapped_headers_index` ON `headerMapping` (`unmappedHeaders`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transactionKey` text NOT NULL,
	`currency` text NOT NULL,
	`accountPlatform` text NOT NULL,
	`accountType` text NOT NULL,
	`description` text NOT NULL,
	`transactionDate` text NOT NULL,
	`transactionType` text NOT NULL,
	`amount` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_transactionKey_unique` ON `transactions` (`transactionKey`);--> statement-breakpoint
CREATE INDEX `transaction_key_index` ON `transactions` (`transactionKey`);