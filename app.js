const express = require('express');
const path = require('path');

const fs = require('fs');
const { randomId, compile, compileMultiple, volName, compiledFile } = require('./docker/dockerfunctions');
const { generateBinFileName, generateMultipleCompileFileName, initSharedVolume } = require('./docker/file_fct.js');

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
    let jsonConfig = req.body;

    let id = randomId()
    let fileName = generateBinFileName(jsonConfig)
    let compiledPath = `/${volName}/results/${id}/${fileName}`

    let status = await compile(id, jsonConfig, fileName)
    if (status === 0) {
        // Send compiled file data and name to client
        res.setHeader('X-File-Name', fileName);
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

// Route compile multiple
app.post('/compile-multiple', async (req, res) => {
    let jsonConfig = req.body;

    let id = randomId()
    let zipName = generateMultipleCompileFileName(jsonConfig.length, jsonConfig[0]);
    let zipPath = `/${volName}/results/${id}.zip`
    let status = await compileMultiple(id, jsonConfig)

    if (status === 0) {
        // Send zip file data and name to client
        res.setHeader('X-File-Name', zipName);
        res.download(zipPath, (err) => {
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