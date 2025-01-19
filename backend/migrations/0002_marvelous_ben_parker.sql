PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transactionKey` text NOT NULL,
	`currency` text NOT NULL,
	`accountPlatform` text,
	`accountType` text NOT NULL,
	`description` text NOT NULL,
	`transactionDate` text NOT NULL,
	`transactionType` text,
	`amount` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "transactionKey", "currency", "accountPlatform", "accountType", "description", "transactionDate", "transactionType", "amount", "createdAt") SELECT "id", "transactionKey", "currency", "accountPlatform", "accountType", "description", "transactionDate", "transactionType", "amount", "createdAt" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_transactionKey_unique` ON `transactions` (`transactionKey`);--> statement-breakpoint
CREATE INDEX `transaction_key_index` ON `transactions` (`transactionKey`);