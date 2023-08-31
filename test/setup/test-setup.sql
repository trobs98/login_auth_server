DROP DATABASE IF EXISTS UserTestSchema;
CREATE DATABASE UserTestSchema;

USE UserTestSchema;

DROP TABLE IF EXISTS UserTestSchema.User;
CREATE TABLE UserTestSchema.User (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `hash_password` varchar(344) NOT NULL,
  `salt` varchar(344) NOT NULL,
  `create_date` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
);

DROP TABLE IF EXISTS UserTestSchema.ResetPasswordToken;
CREATE TABLE UserTestSchema.ResetPasswordToken (
  `id` int NOT NULL AUTO_INCREMENT,
  `FK_userId` int NOT NULL,
  `hash_token` varchar(344) NOT NULL,
  `salt` varchar(344) NOT NULL,
  `expiration_date` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_userId_idx` (`FK_userId`),
  CONSTRAINT `FK_ResetPassword_userId` FOREIGN KEY (`FK_userId`) REFERENCES `User` (`id`)
);

DROP TABLE IF EXISTS UserTestSchema.UserAudit;
CREATE TABLE UserTestSchema.UserAudit (
  `id` int NOT NULL AUTO_INCREMENT,
  `FK_userId` int NOT NULL,
  `login_date` varchar(25) NOT NULL,
  `login_IP` varchar(100) NOT NULL,
  `cookie` varchar(250) NOT NULL,
  `expiry_date` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_userId_UserAudit_idx` (`FK_userId`),
  CONSTRAINT `FK_userId` FOREIGN KEY (`FK_userId`) REFERENCES `User` (`id`)
);