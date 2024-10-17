const express = require('express');
const path = require('path');

const { dockerfunctions, createContainer, compile } = require('./docker/dockerfunctions');

const app = express();
const port = process.env.PORT || 4050;



// Lien statique publique
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/compile', (req, res) => {
    const jsonConfig = req.body;
    compile(jsonConfig);  
    res.status(204).send();
});


// Start serveur sur port 4050
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});


