const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Lien statique publique
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start serveur sur port 3000
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});