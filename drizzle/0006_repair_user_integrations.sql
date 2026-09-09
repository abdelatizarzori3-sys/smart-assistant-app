CREATE TABLE IF NOT EXISTS `user_integrations` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `provider` varchar(64) NOT NULL,
  `accountId` varchar(190),
  `accountName` varchar(255),
  `accessTokenEncrypted` text NOT NULL,
  `refreshTokenEncrypted` text,
  `expiresAt` timestamp,
  `scopes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_integrations_user_provider_unique` (`userId`,`provider`),
  KEY `user_integrations_user_idx` (`userId`),
  CONSTRAINT `user_integrations_user_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
);