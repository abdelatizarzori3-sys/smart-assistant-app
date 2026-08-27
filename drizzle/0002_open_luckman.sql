CREATE TABLE `workspace_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int NOT NULL,
	`messageId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`content` text NOT NULL,
	`model` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workspace_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `workspace_results` ADD CONSTRAINT `workspace_results_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_results` ADD CONSTRAINT `workspace_results_sessionId_workspace_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `workspace_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_results` ADD CONSTRAINT `workspace_results_messageId_workspace_messages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `workspace_messages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `workspace_results_user_created_idx` ON `workspace_results` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `workspace_results_session_created_idx` ON `workspace_results` (`sessionId`,`createdAt`);