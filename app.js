const express = require('express');
const path = require('path');
const { dockerfunctions, createContainer, startCompilerContainer } = require('./docker/dockerfunctions');

const app = express();
const port = process.env.PORT || 4050;

// Lien statique publique
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

startCompilerContainer(15);

// Start serveur sur port 4050
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});