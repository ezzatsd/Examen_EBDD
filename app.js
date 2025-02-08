require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');

const app = express();
app.use(express.json());

// Configuration de la base de données
const dbConfig = {
    host: process.env.HOST,
    user: 'root',
    password: process.env.PASSWORD,
    database: 'avion', 
    multipleStatements: true
};


const dbFile = 'src/database/database.sql';
const insertFile = 'src/database/Insert.sql';


const executeSQLFile = async (connection, filePath) => {
    const sql = fs.readFileSync(filePath, 'utf8');
    await connection.query(sql);
    console.log(`${filePath} exécuté avec succès`);
};


const initDB = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connexion à MySQL réussie');

        
        await executeSQLFile(connection, dbFile);
        await executeSQLFile(connection, insertFile);

        console.log('Base de données initialisée avec succès');
        return connection;
    } catch (err) {
        console.error('Erreur lors de l\'initialisation de la base de données :', err);
        process.exit(1);
    }
};


app.get('/', (req, res) => {
    res.send('Bienvenue sur le serveur de gestion des produits et commandes');
});


initDB().then(connection => {
    
    app.post('/produits', async (req, res) => {
        const { nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs } = req.body;

        
        const [categorie] = await connection.query(
            `SELECT * FROM Categories WHERE id = ?`,
            [id_categorie]
        );
        const [fournisseur] = await connection.query(
            `SELECT * FROM Fournisseurs WHERE id = ?`,
            [id_fournisseurs]
        );

        if (categorie.length === 0 || fournisseur.length === 0) {
            return res.status(400).json({ message: 'Catégorie ou fournisseur non trouvé' });
        }

        
        const sql = `INSERT INTO Produits (nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs) VALUES (?, ?, ?, ?, ?)`;
        await connection.query(sql, [nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs]);
        res.status(201).json({ message: 'Produit ajouté avec succès' });
    });

    app.get('/produits', async (req, res) => {
        const { nom } = req.query;
        const [result] = await connection.query(`SELECT * FROM Produits WHERE nom = ?`, [nom]);
        res.json(result);
    });

    app.put('/produits', async (req, res) => {
        const { id, nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs } = req.body;

        
        const [categorie] = await connection.query(
            `SELECT * FROM Categories WHERE id = ?`,
            [id_categorie]
        );
        const [fournisseur] = await connection.query(
            `SELECT * FROM Fournisseurs WHERE id = ?`,
            [id_fournisseurs]
        );

        if (categorie.length === 0 || fournisseur.length === 0) {
            return res.status(400).json({ message: 'Catégorie ou fournisseur non trouvé' });
        }

        
        const sql = `UPDATE Produits SET nom = ?, prix_unitaire = ?, quantité_stock = ?, id_categorie = ?, id_fournisseurs = ? WHERE id = ?`;
        await connection.query(sql, [nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs, id]);
        res.status(200).json({ message: 'Produit mis à jour avec succès' });
    });

    app.delete('/produits', async (req, res) => {
        const { id } = req.body;

        
        const [lignesCommande] = await connection.query(
            `SELECT * FROM Lignes_Commande WHERE id_produit = ?`,
            [id]
        );

        if (lignesCommande.length > 0) {
            return res.status(400).json({ message: 'Le produit est utilisé dans une commande et ne peut pas être supprimé' });
        }

        
        const sql = `DELETE FROM Produits WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Produit supprimé avec succès' });
    });

    
    app.get('/categories', async (req, res) => {
        const { nom_categorie } = req.query;
        const [result] = await connection.query(`SELECT * FROM Categories WHERE nom_categorie = ?`, [nom_categorie]);
        res.json(result);
    });

    app.post('/categories', async (req, res) => {
        const { nom_categorie } = req.body;
        const sql = `INSERT INTO Categories (nom_categorie) VALUES (?)`;
        await connection.query(sql, [nom_categorie]);
        res.status(201).json({ message: 'Catégorie ajoutée avec succès' });
    });

    app.put('/categories', async (req, res) => {
        const { id, nom_categorie } = req.body;
        const sql = `UPDATE Categories SET nom_categorie = ? WHERE id = ?`;
        await connection.query(sql, [nom_categorie, id]);
        res.status(200).json({ message: 'Catégorie mise à jour avec succès' });
    });

    app.delete('/categories', async (req, res) => {
        const { id } = req.body;

        
        const [produits] = await connection.query(
            `SELECT * FROM Produits WHERE id_categorie = ?`,
            [id]
        );

        if (produits.length > 0) {
            return res.status(400).json({ message: 'La catégorie est utilisée par un produit et ne peut pas être supprimée' });
        }

        
        const sql = `DELETE FROM Categories WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Catégorie supprimée avec succès' });
    });

    // Gestion des fournisseurs
    app.get('/fournisseurs', async (req, res) => {
        const { nom } = req.query;
        const [result] = await connection.query(`SELECT * FROM Fournisseurs WHERE nom = ?`, [nom]);
        res.json(result);
    });

    app.post('/fournisseurs', async (req, res) => {
        const { nom, prenom, adresse, telephone } = req.body;
        const sql = `INSERT INTO Fournisseurs (nom, prenom, adresse, téléphone) VALUES (?, ?, ?, ?)`;
        await connection.query(sql, [nom, prenom, adresse, telephone]);
        res.status(201).json({ message: 'Fournisseur ajouté avec succès' });
    });

    app.put('/fournisseurs', async (req, res) => {
        const { id, nom, prenom, adresse, telephone } = req.body;
        const sql = `UPDATE Fournisseurs SET nom = ?, prenom = ?, adresse = ?, téléphone = ? WHERE id = ?`;
        await connection.query(sql, [nom, prenom, adresse, telephone, id]);
        res.status(200).json({ message: 'Fournisseur mis à jour avec succès' });
    });

    app.delete('/fournisseurs', async (req, res) => {
        const { id } = req.body;

        // Vérifier que le fournisseur n'est pas utilisé par un produit
        const [produits] = await connection.query(
            `SELECT * FROM Produits WHERE id_fournisseurs = ?`,
            [id]
        );

        if (produits.length > 0) {
            return res.status(400).json({ message: 'Le fournisseur est utilisé par un produit et ne peut pas être supprimé' });
        }

        // Supprimer le fournisseur
        const sql = `DELETE FROM Fournisseurs WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Fournisseur supprimé avec succès' });
    });

    // Gestion des commandes
    app.post('/commandes', async (req, res) => {
        const { date_commande, id_client, produits } = req.body; 

        
        const conn = connection; 
        await conn.beginTransaction();

        try {
            
            const [client] = await conn.query(
                `SELECT * FROM Clients WHERE id = ?`,
                [id_client]
            );

            if (client.length === 0) {
                await conn.rollback();
                return res.status(400).json({ message: 'Client non trouvé' });
            }

            // Vérifier que la date de commande est valide
            if (!date_commande || isNaN(new Date(date_commande).getTime())) {
                await conn.rollback();
                return res.status(400).json({ message: 'Date de commande invalide' });
            }

            // Vérifier le stock pour chaque produit
            for (const produit of produits) {
                const { id_produit, quantite } = produit;

                // Vérifier que le produit existe
                const [produitInfo] = await conn.query(
                    `SELECT * FROM Produits WHERE id = ?`,
                    [id_produit]
                );

                if (produitInfo.length === 0) {
                    await conn.rollback();
                    return res.status(400).json({ message: `Produit avec l'ID ${id_produit} non trouvé` });
                }

                // Vérifier que la quantité demandée est disponible en stock
                if (produitInfo[0].quantité_stock < quantite) {
                    await conn.rollback();
                    return res.status(400).json({ message: `Stock insuffisant pour le produit avec l'ID ${id_produit}` });
                }
            }

            // Créer la commande
            const [commandeResult] = await conn.query(
                `INSERT INTO Commandes (date_commande, id_client) VALUES (?, ?)`,
                [date_commande, id_client]
            );

            const id_commande = commandeResult.insertId;

            // Ajouter les lignes de commande 
            for (const produit of produits) {
                const { id_produit, quantite, prix_unitaire } = produit;

                // Ajouter la ligne de commande
                await conn.query(
                    `INSERT INTO Lignes_Commande (id_commande, id_produit, quantite, prix_unitaire) VALUES (?, ?, ?, ?)`,
                    [id_commande, id_produit, quantite, prix_unitaire]
                );

                
                await conn.query(
                    `UPDATE Produits SET quantité_stock = quantité_stock - ? WHERE id = ?`,
                    [quantite, id_produit]
                );
            }

            // Valider la transaction
            await conn.commit();

            res.status(201).json({ message: 'Commande enregistrée avec succès', id_commande });
        } catch (err) {
            
            await conn.rollback();
            console.error('Erreur lors de la création de la commande :', err);
            res.status(500).json({ message: 'Erreur interne du serveur' });
        } 
    });

    app.get('/commandes', async (req, res) => {
        const { id_client, start, end } = req.query;
        if (start && end) {
            const [result] = await connection.query(
                `SELECT * FROM Commandes WHERE date_commande BETWEEN ? AND ?`,
                [start, end]
            );
            res.json(result);
        } else if (id_client) {
            const [result] = await connection.query(
                `SELECT * FROM Commandes WHERE id_client = ?`,
                [id_client]
            );
            res.json(result);
        } else {
            const [result] = await connection.query(`SELECT * FROM Commandes`);
            res.json(result);
        }
    });

    app.put('/commandes', async (req, res) => {
        const { id, date_commande, id_client } = req.body;
        const sql = `UPDATE Commandes SET date_commande = ?, id_client = ? WHERE id = ?`;
        await connection.query(sql, [date_commande, id_client, id]);
        res.status(200).json({ message: 'Commande mise à jour avec succès' });
    });

    app.delete('/commandes', async (req, res) => {
        const { id } = req.body;
        const sql = `DELETE FROM Commandes WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Commande supprimée avec succès' });
    });

    // Gestion des lignes de commande
    app.post('/lignes_commande', async (req, res) => {
        const { id_commande, id_produit, quantite, prix_unitaire } = req.body;

        // Démarrer une transaction
        const conn = connection; 
        await conn.beginTransaction();

        try {
            // Vérifier que la commande existe
            const [commande] = await conn.query(
                `SELECT * FROM Commandes WHERE id = ?`,
                [id_commande]
            );

            if (commande.length === 0) {
                await conn.rollback();
                return res.status(400).json({ message: 'Commande non trouvée' });
            }

            // Vérifier que le produit existe
            const [produit] = await conn.query(
                `SELECT * FROM Produits WHERE id = ?`,
                [id_produit]
            );

            if (produit.length === 0) {
                await conn.rollback();
                return res.status(400).json({ message: 'Produit non trouvé dans le catalogue' });
            }

            // Vérifier que la quantité demandée est disponible en stock
            if (produit[0].quantité_stock < quantite) {
                await conn.rollback();
                return res.status(400).json({ message: 'Stock insuffisant' });
            }

            // Décrémenter le stock
            await conn.query(
                `UPDATE Produits SET quantité_stock = quantité_stock - ? WHERE id = ?`,
                [quantite, id_produit]
            );

            // Ajouter la ligne de commande
            const sql = `INSERT INTO Lignes_Commande (id_commande, id_produit, quantite, prix_unitaire) VALUES (?, ?, ?, ?)`;
            await conn.query(sql, [id_commande, id_produit, quantite, prix_unitaire]);

            // Valider la transaction
            await conn.commit();

            res.status(201).json({ message: 'Ligne de commande ajoutée avec succès' });
        } catch (err) {
            
            await conn.rollback();
            console.error('Erreur lors de l\'ajout de la ligne de commande :', err);
            res.status(500).json({ message: 'Erreur interne du serveur' });
        } 
    });

    app.get('/lignes_commande', async (req, res) => {
        const { id_commande } = req.query;
        const [result] = await connection.query(
            `SELECT * FROM Lignes_Commande WHERE id_commande = ?`,
            [id_commande]
        );
        res.json(result);
    });

    app.put('/lignes_commande', async (req, res) => {
        const { id, id_commande, id_produit, quantite, prix_unitaire } = req.body;
        const sql = `UPDATE Lignes_Commande SET id_commande = ?, id_produit = ?, quantite = ?, prix_unitaire = ? WHERE id = ?`;
        await connection.query(sql, [id_commande, id_produit, quantite, prix_unitaire, id]);
        res.status(200).json({ message: 'Ligne de commande mise à jour avec succès' });
    });

    app.delete('/lignes_commande', async (req, res) => {
        const { id } = req.body;
        const sql = `DELETE FROM Lignes_Commande WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Ligne de commande supprimée avec succès' });
    });

    // Gestion des clients
    app.get('/clients', async (req, res) => {
        const { id } = req.query;
        const [result] = await connection.query(`SELECT * FROM Clients WHERE id = ?`, [id]);
        res.json(result);
    });

    app.post('/clients', async (req, res) => {
        const { nom, prenom, adresse, téléphone } = req.body;
        const sql = `INSERT INTO Clients (nom, prenom, adresse, téléphone) VALUES (?, ?, ?, ?)`;
        await connection.query(sql, [nom, prenom, adresse, téléphone]);
        res.status(201).json({ message: 'Client ajouté avec succès' });
    });

    app.put('/clients', async (req, res) => {
        const { id, nom, prenom, adresse, téléphone } = req.body;
        const sql = `UPDATE Clients SET nom = ?, prenom = ?, adresse = ?, téléphone = ? WHERE id = ?`;
        await connection.query(sql, [nom, prenom, adresse, téléphone, id]);
        res.status(200).json({ message: 'Client mis à jour avec succès' });
    });

    app.delete('/clients', async (req, res) => {
        const { id } = req.body;
        const sql = `DELETE FROM Clients WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Client supprimé avec succès' });
    });

    // Rechercher les commandes d’un client
    app.get('/clients/:id/commandes', async (req, res) => {
        const { id } = req.params;
        const [result] = await connection.query(
            `SELECT * FROM Commandes WHERE id_client = ?`,
            [id]
        );
        res.json(result);
    });

    // Lister les commandes qui contiennent un article précis
    app.get('/produits/:id/commandes', async (req, res) => {
        const { id } = req.params;
        const [result] = await connection.query(
            `SELECT Commandes.* FROM Commandes
             JOIN Lignes_Commande ON Commandes.id = Lignes_Commande.id_commande
             WHERE Lignes_Commande.id_produit = ?`,
            [id]
        );
        res.json(result);
    });

    // Recherche multi-critères (client, date, statut, produit...)
    app.get('/commandes/recherche', async (req, res) => {
        const { id_client, start, end, id_produit } = req.query;
        let sql = `SELECT Commandes.* FROM Commandes
                   JOIN Lignes_Commande ON Commandes.id = Lignes_Commande.id_commande
                   WHERE 1=1`;
        const params = [];

        if (id_client) {
            sql += ` AND Commandes.id_client = ?`;
            params.push(id_client);
        }
        if (start && end) {
            sql += ` AND Commandes.date_commande BETWEEN ? AND ?`;
            params.push(start, end);
        }
        if (id_produit) {
            sql += ` AND Lignes_Commande.id_produit = ?`;
            params.push(id_produit);
        }

        const [result] = await connection.query(sql, params);
        res.json(result);
    });

    // Statistiques simples (produits les plus vendus, total des ventes sur une période...)
    app.get('/statistiques/produits-plus-vendus', async (req, res) => {
        const [result] = await connection.query(
            `SELECT Produits.nom, SUM(Lignes_Commande.quantite) AS total_vendu
             FROM Lignes_Commande
             JOIN Produits ON Lignes_Commande.id_produit = Produits.id
             GROUP BY Produits.id
             ORDER BY total_vendu DESC`
        );
        res.json(result);
        });

    app.get('/statistiques/total-ventes', async (req, res) => {
        const { start, end } = req.query;
        const [result] = await connection.query(
            `SELECT SUM(Lignes_Commande.quantite * Lignes_Commande.prix_unitaire) AS total_ventes
             FROM Lignes_Commande
             JOIN Commandes ON Lignes_Commande.id_commande = Commandes.id
             WHERE Commandes.date_commande BETWEEN ? AND ?`,
            [start, end]
        );
        res.json(result);
    });

    
    app.get('/produits/stock-faible', async (req, res) => {
        const { seuil } = req.query;
        const [result] = await connection.query(
            `SELECT * FROM Produits WHERE quantité_stock < ?`,
            [seuil]
        );
        res.json(result);
    });

    // Démarrer le serveur
    const PORT = process.env.PORT || 3006;
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
});