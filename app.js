const express = require('express');
const path = require('path');

const fs = require('fs');
const { compile, randomId, volName, compiledFile } = require('./docker/dockerfunctions');
const { initSharedVolume } = require('./docker/file_fct.js');

const app = express();
const port = process.env.PORT || 4050;

// Public static link
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

/* ROUTES */

// Route index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route compile
app.post('/compile', async (req, res) => {
    const formData = req.body;

    let id = randomId()
    let compiledPath = `/${volName}/results/${id}/${compiledFile}`

    let status = await compile(id, formData)
    if (status === 0) {
        // Send compiled file data to client
        res.download(compiledPath, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error downloading the file');
            }
        });
    } else {
        // Send an error response
        res.status(400).send('Compilation Error');
    }

});

/* INIT */

// Start serveur on port 4050
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

initSharedVolume(volName);