require('dotenv').config();
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const { initSocket, sendLogToClient } = require('./sockets/socketInstance');
const { randomId, compile, compileMultiple, volName, stopContainer, containerIdMap } = require('./docker/dockerfunctions');
const { generateBinFileName, generateMultipleCompileFileName, initSharedVolume } = require('./docker/file_fct.js');

const app = express();
const port = process.env.PORT || 4050;

// Load SSL certificates
const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
};

// Public static link
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.set('trust proxy', true);

/* ROUTES */

// Route index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route compile
app.post('/compile', async (req, res) => {
    clientId = req.body.clientId;
    jsonConfig = req.body.formData;

    sendLogToClient(clientId, 'Compilation is starting...')

    let id = randomId();
    let fileName = generateBinFileName(jsonConfig);
    let compiledPath = `/${volName}/results/${id}/${fileName}`;

    let status = await compile(clientId, id, jsonConfig, fileName);

    if (status === 0) {
        // Send compiled file data and name to client
        res.setHeader('compiler-status', status);
        res.setHeader('X-File-Name', fileName);
        res.download(compiledPath, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error downloading the file');
            }
        });
    } else if (status === 137) {
        res.setHeader('compiler-status', status);
        res.status(200).send();
    } else {
        // Send an error response
        res.status(400).send('Compilation Error');
    }
});

// Route compile multiple
app.post('/compile-multiple', async (req, res) => {
    clientId = req.body.clientId;
    jsonConfig = req.body.formData;

    sendLogToClient(clientId, 'Compilation is starting...')

    let compileId = randomId();
    let zipName = generateMultipleCompileFileName(jsonConfig.length, jsonConfig[0]);
    let zipPath = `/${volName}/results/${compileId}.zip`;
    let status = await compileMultiple(clientId, compileId, jsonConfig);

    if (status === 0) {
        // Send zip file data and name to client
        res.setHeader('X-File-Name', zipName);
        res.setHeader('compiler-status', status);
        res.download(zipPath, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error downloading the file');
            }
        });
    } else if (status === 137) {
        res.setHeader('compiler-status', status);
        res.status(200).send();
    } else {
        // Send an error response
        res.status(400).send('Compilation Error');
    }
});

/* INIT */

const server = https.createServer(options, app);
initSocket(server, containerIdMap);

// Start server on port 4050
server.listen(port, () => {
    console.log(`HTTPS server running at https://localhost:${port}`);
});

initSharedVolume(volName);