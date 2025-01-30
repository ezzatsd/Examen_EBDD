require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ezzat2000',
    database: 'avion'
});

db.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données');
});

//  Ajouter une route pour la page d'accueil
app.get('/', (req, res) => {
    res.send('API de gestion des produits !');
});

//  Endpoint pour récupérer tous les produits
app.get('/produits', (req, res) => {
    db.query('SELECT * FROM Produits', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des produits:', err);
            res.status(500).json({ error: 'Erreur interne du serveur' });
            return;
        }
        res.json(results);
    });
});

//  Démarrer le serveur
app.listen(3006, () => {
    console.log('Serveur démarré sur http://localhost:3006');
});
