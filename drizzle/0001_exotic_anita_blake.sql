CREATE TABLE `workspace_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(160) NOT NULL,
	`sizeBytes` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(700) NOT NULL,
	`status` enum('ready','processing','failed') NOT NULL DEFAULT 'ready',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workspace_files_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_files_storageKey_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
CREATE TABLE `workspace_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workspace_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspace_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `workspace_files` ADD CONSTRAINT `workspace_files_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_files` ADD CONSTRAINT `workspace_files_sessionId_workspace_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `workspace_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_messages` ADD CONSTRAINT `workspace_messages_sessionId_workspace_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `workspace_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_sessions` ADD CONSTRAINT `workspace_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `workspace_files_user_created_idx` ON `workspace_files` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `workspace_files_session_created_idx` ON `workspace_files` (`sessionId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `workspace_messages_session_created_idx` ON `workspace_messages` (`sessionId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `workspace_sessions_user_updated_idx` ON `workspace_sessions` (`userId`,`updatedAt`);