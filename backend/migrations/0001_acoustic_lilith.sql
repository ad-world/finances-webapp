CREATE TABLE `descriptionMapping` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uncleanDescription` text NOT NULL,
	`cleanDescription` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `unclean_description_index` ON `descriptionMapping` (`uncleanDescription`);