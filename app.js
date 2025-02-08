require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');

const app = express();
app.use(express.json());

const dbConfig = {
    host: process.env.HOST,
    user: 'root',
    password: process.env.PASSWORD,
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

        // Remplacer les chemins relatifs pour l'exécution des fichiers SQL
        await executeSQLFile(connection, dbFile);

        await connection.changeUser({ database: 'avion' });

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
        const sql = `INSERT INTO Produits (nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs) VALUES (?,?, ?, ?, ?)`;
        await connection.query(sql, [nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs]);
        res.status(201).json({ message: 'Produit ajouté avec succès' });
    });

    app.get('/produits', async (req, res) => {
        const { nom } = req.query;
        const [result] = await connection.query(`SELECT * FROM Produits WHERE nom= ?`);
        res.json(result);
    });

    app.put('/produits', async (req, res) => {
        const {id, nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs } = req.body; 
        const sql = `UPDATE Produits SET nom = ?, prix_unitaire = ?, quantité_stock = ?, id_categorie = ?, id_fournisseurs = ? WHERE id = ?`;
        await connection.query(sql, [id,nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs]);
        res.status(200).json({ message: 'Produit mis à jour avec succès' });
    });

    app.delete('/produits', async (req, res) => {
        const { id } = req.body;
        const sql = `DELETE FROM Produits WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Produit supprimé avec succès' });
    });

    app.get('/categories', async (req, res) => {
        const { nom_categorie } = req.query;
        const [result] = await connection.query(`SELECT * FROM Categories WHERE nom_categorie = ?`);
        res.json(result);
    });

    app.post('/categories', async (req, res) => {
        const {nom_categorie } = req.body;
        const sql = `INSERT INTO Categories (nom_categorie) VALUES (?)`;
        await connection.query(sql, [ nom_categorie]);
        res.status(201).json({ message: 'Catégories ajouté avec succès' });
    });

    app.put('/categories', async (req, res) => {
        const {id,  nom_categorie } = req.body;
        const sql = `UPDATE Categories SET nom_categorie = ? WHERE id = ?`;
        await connection.query(sql, [id, nom_categorie]);
        res.status(200).json({ message: 'Catégories mis à jour avec succès' });
    });

    app.delete('/categories', async (req, res) => {
        const { id } = req.body;
        const sql = `DELETE FROM Categories WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Catégories supprimé avec succès' });
    })


    app.get('/fournisseurs', async (req, res) => {
        const { nom } = req.query;
        const [result] = await connection.query(`SELECT * FROM Fournisseurs WHERE nom =?`);
        res.json(result);
    });

    app.post('/fournisseurs', async (req, res) => {
        const { nom, prenom, adresse, telephone } = req.body;
        const sql = `INSERT INTO Fournisseurs (nom, prenom, adresse, téléphone) VALUES ( ?,?, ?, ?)`;
        await connection.query(sql, [ nom, prenom, adresse, telephone]);
        res.status(201).json({ message: 'Fournisseur ajouté avec succès' });
    });

    app.put('/fournisseurs', async (req, res) => {
        const {id, nom, prenom, adresse, telephone } = req.body;
        const sql = `UPDATE Fournisseurs SET nom = ?, prenom = ?, adresse = ?, telephone = ? WHERE id = ?`;
        await connection.query(sql, [id,  nom, prenom, adresse, telephone]);
        res.status(200).json({ message: 'Fournisseur mis à jour avec succès' });
    });

    app.delete('/fournisseurs', async (req, res) => {
        const { id } = req.body;
        const sql = `DELETE FROM Fournisseurs WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Fournisseur supprimé avec succès' });
    });

    app.post('/commandes', async (req, res) => {
        const { date_commande, id_client } = req.body;
        const sql = `INSERT INTO Commandes (date_commande, id_client) VALUES (?,?)`;
        await connection.query(sql, [date_commande, id_client]);
        res.status(201).json({ message: 'Commande enregistrée avec succès' });
    });

    app.get('/commandes', async (req, res) => {
        const { id_client, start, end } = req.query;
        if (start && end) {
            // Filtrer par période 
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
            // Retourner toutes les commandes si aucun filtre n'est fourni
            const [result] = await connection.query(`SELECT * FROM Commandes`);
            res.json(result);
        }
    });

    app.put('/commandes', async (req, res) => {
        const { id, date_commande, id_client } = req.body;
        const sql = `UPDATE Commandes SET date_commande = ?, id_client = ? WHERE id = ?`;
        await connection.query(sql, [date_commande, id_client]);
        res.status(200).json({ message: 'Commande mise à jour avec succès' });
    });

    app.delete ('/commandes', async (req, res) => {
        const { id } = req.body;
        const sql = `DELETE FROM Commandes WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Commande supprimée avec succès' });
    });

    app.post('/lignes_commande', async (req, res) => {
        const { id_commande, id_produit, quantite, prix_unitaire } = req.body;
        const sql = `INSERT INTO Lignes_Commande (id_commande, id_produit, quantite, prix_unitaire) VALUES (?,?, ?, ?)`;
        await connection.query(sql, [id_commande, id_produit, quantite, prix_unitaire]);
        res.status(201).json({ message: 'Ligne de commande ajoutée avec succès' });
    });

    app.get('/lignes_commande', async (req, res) => {
        const { id_commande } = req.query;
        const [result] = await connection.query(`SELECT * FROM Lignes_Commande WHERE id_commande = ?`);
        res.json(result);
    });

    app.put('/lignes_commande', async (req, res) => {
        const { id, id_commande, id_produit, quantite, prix_unitaire } = req.body;
        const sql = `UPDATE Lignes_Commande SET id_commande = ?, id_produit = ?, quantite = ?, prix_unitaire = ? WHERE id = ?`;
        await connection.query(sql, [id, id_commande, id_produit, quantite, prix_unitaire]);
        res.status(200).json({ message: 'Ligne de commande mise à jour avec succès' });
    });

    app.delete('/lignes_commande', async (req, res) => {
        const { id } = req.body;
        const sql = `DELETE FROM Lignes_Commande WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Ligne de commande supprimée avec succès' });
    });

    app.get('/clients', async (req, res) => {
        const { id } = req.query;
        const [result] = await connection.query(`SELECT * FROM Clients WHERE id = ?`);
        res.json(result);
    });

    app.post('/clients', async (req, res) => {
        const {nom, prenom, adresse,téléphone} = req.body;
        const sql = `INSERT INTO Clients (nom, prenom, adresse,téléphone) VALUES (?, ?, ?, ?)`;
        await connection.query(sql, [nom, prenom, adresse,téléphone]);
        res.status(201).json({ message: 'Client ajouté avec succès' });
    });

    app.put('/clients', async (req, res) => {
        const {id, nom, prenom, adresse,téléphone} = req.body;
        const sql = `UPDATE Clients SET nom = ?, prenom = ?, adresse = ?, téléphone = ? WHERE id = ?`;
        await connection.query(sql, [id, nom, prenom, adresse,téléphone]);
        res.status(200).json({ message: 'Client mis à jour avec succès' });
    });

    app.delete('/clients', async (req, res) => {
        const { id } = req.body;
        const sql = `DELETE FROM Clients WHERE id = ?`;
        await connection.query(sql, [id]);
        res.status(200).json({ message: 'Client supprimé avec succès' });
    });

    const PORT = process.env.PORT || 3006;
    app.listen(PORT, () => {
        console.log('Serveur démarré sur http://localhost:3006');

    });
});
