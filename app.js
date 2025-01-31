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
        const sql = 'INSERT INTO Produits (nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs) VALUES (?, ?, ?, ?, ?)';
        await connection.query(sql, [nom, prix_unitaire, quantité_stock, id_categorie, id_fournisseurs]);
        res.status(201).json({ message: 'Produit ajouté avec succès' });
    });

    app.get('/produits', async (req, res) => {
        const { nom } = req.query;
        const [result] = await connection.query(`SELECT * FROM Produits WHERE nom='${nom}'`);
        res.json(result);
    });

    app.get('/categories', async (req, res) => {
        const [result] = await connection.query('SELECT * FROM Categories');
        res.json(result);
    });

    app.get('/fournisseurs', async (req, res) => {
        const [result] = await connection.query('SELECT * FROM Fournisseurs');
        res.json(result);
    });

    app.post('/commandes', async (req, res) => {
        const { date_commande, id_client } = req.body;
        const sql = 'INSERT INTO Commandes (date_commande, id_client) VALUES (?, ?)';
        await connection.query(sql, [date_commande, id_client]);
        res.status(201).json({ message: 'Commande enregistrée avec succès' });
    });

    app.get('/commandes', async (req, res) => {
        const [result] = await connection.query('SELECT * FROM Commandes');
        res.json(result);
    });

    app.post('/lignes_commande', async (req, res) => {
        const { id_commande, id_produit, quantite, prix_unitaire } = req.body;
        const sql = 'INSERT INTO Lignes_Commande (id_commande, id_produit, quantite, prix_unitaire) VALUES (?, ?, ?, ?)';
        await connection.query(sql, [id_commande, id_produit, quantite, prix_unitaire]);
        res.status(201).json({ message: 'Ligne de commande ajoutée avec succès' });
    });

    app.get('/clients', async (req, res) => {
        const [result] = await connection.query('SELECT * FROM Clients');
        res.json(result);
    });

    const PORT = process.env.PORT || 3006;
    app.listen(PORT, () => {
        console.log('Serveur démarré sur http://localhost:3006');

    });
});
