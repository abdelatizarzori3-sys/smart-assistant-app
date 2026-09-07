CREATE TABLE IF NOT EXISTS `billing_subscriptions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `planId` varchar(32) NOT NULL DEFAULT 'free',
  `provider` varchar(32) NOT NULL DEFAULT 'paypal',
  `providerSubscriptionId` varchar(190),
  `status` enum('active','pending','cancelled','expired','suspended') NOT NULL DEFAULT 'pending',
  `currentPeriodStart` timestamp,
  `currentPeriodEnd` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `billing_subscriptions_user_idx` (`userId`),
  KEY `billing_subscriptions_provider_id_idx` (`provider`,`providerSubscriptionId`),
  CONSTRAINT `billing_subscriptions_user_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `billing_usage` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `periodKey` varchar(16) NOT NULL,
  `messageCount` int NOT NULL DEFAULT 0,
  `toolExecutionCount` int NOT NULL DEFAULT 0,
  `tokenCount` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `billing_usage_user_period_idx` (`userId`,`periodKey`),
  CONSTRAINT `billing_usage_user_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `billing_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `provider` varchar(32) NOT NULL,
  `eventId` varchar(190) NOT NULL,
  `eventType` varchar(120) NOT NULL,
  `userId` int,
  `payload` text NOT NULL,
  `processedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `billing_events_event_id_unique` (`eventId`),
  KEY `billing_events_user_created_idx` (`userId`,`createdAt`),
  CONSTRAINT `billing_events_user_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
);