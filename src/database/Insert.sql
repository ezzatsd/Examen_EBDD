-- Insertion des catégories
INSERT INTO Categories (nom_categorie) VALUES
('Avions de chasse'),
('Avions commerciaux');

-- Insertion des fournisseurs
INSERT INTO Fournisseurs (nom, prenom, adresse, téléphone) VALUES
('AeroPaper', 'Jean', '123 Rue des Ailes', 0601020304),
('SkyModels', 'Paul', '45 Avenue des Pilotes', 0605060708);

-- Insertion des produits
INSERT INTO Produits (nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs) VALUES
('F-16', 25.99, 50, 1, 2),
('Boeing 747', 45.99, 30, 2, 1),
('Rafale', 28.50, 40, 1, 1);



-- Insertion des clients
INSERT INTO Clients (nom, prenom, adresse, téléphone) VALUES
('Dupont', 'Jean', '10 Rue des Nuages', 0611223344),
('Martin', 'Sophie', '23 Boulevard des Avions', 0622334455);

-- Insertion des commandes
INSERT INTO Commandes (date_commande, id_client) VALUES
('2024-01-30 14:30:00', 1),
('2024-01-31 10:15:00', 2);

-- Insertion des lignes de commande
INSERT INTO Lignes_Commande (id_commande, id_produit, quantite, prix_unitaire) VALUES
(1, 1, 2, 25.99),
(1, 3, 1, 28.50),
(2, 2, 1, 45.99);
