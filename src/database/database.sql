CREATE DATABASE avion;
USE avion;

CREATE TABLE `Produits` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(45) NOT NULL,
  `prix_unitaire` FLOAT NOT NULL,
  `quantité_stock` INT NOT NULL,
  `id_categorie` INT NOT NULL,
  `id_fournisseurs` INT NOT NULL
);

CREATE TABLE `Catégories` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nom_categorie` VARCHAR(45) NOT NULL
);

CREATE TABLE `Fournisseurs` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(45) NOT NULL,
  `prenom` VARCHAR(45) NOT NULL,
  `adresse` VARCHAR(100) NOT NULL,
  `téléphone` INT NOT NULL
);

CREATE TABLE `Clients` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(45) NOT NULL,
  `prenom` VARCHAR(45) NOT NULL,
  `adresse` VARCHAR(100) NOT NULL,
  `téléphone` INT NOT NULL
);

CREATE TABLE `Commandes` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `date_commande` DATETIME NOT NULL,
  `id_client` INT NOT NULL
);

CREATE TABLE `Lignes_Commande` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `id_commande` INT NOT NULL,
  `id_produit` INT NOT NULL,
  `quantite` INT NOT NULL,
  `prix_unitaire` FLOAT NOT NULL
);

ALTER TABLE `Produits` ADD FOREIGN KEY (`id_categorie`) REFERENCES `Catégories` (`id`);

ALTER TABLE `Produits` ADD FOREIGN KEY (`id_fournisseurs`) REFERENCES `Fournisseurs` (`id`);

ALTER TABLE `Commandes` ADD FOREIGN KEY (`id_client`) REFERENCES `Clients` (`id`);

ALTER TABLE `Lignes_Commande` ADD FOREIGN KEY (`id_produit`) REFERENCES `Produits` (`id`);

ALTER TABLE `Lignes_Commande` ADD FOREIGN KEY (`id_commande`) REFERENCES `Commandes` (`id`);
