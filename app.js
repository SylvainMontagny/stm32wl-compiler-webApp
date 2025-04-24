require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const cron = require('node-cron');
const { initSocket, sendLogToClient } = require('./sockets/socketInstance');
const { randomId, compile, compileMultiple, volName, stopContainer, containerIdMap } = require('./docker/dockerfunctions');
const { generateBinFileName, generateMultipleCompileFileName, initSharedVolume, clearVolumeFolders } = require('./docker/file_fct.js');

const app = express();
const port = process.env.PORT || 4050;

// Public static link
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.set('trust proxy', true);

/* CRON */

cron.schedule('0 3 * * *', () => {
    console.log(`CRON volume clean up started at ${new Date().toLocaleString()}`);
    clearVolumeFolders(volName);
}, {
    timezone: "Europe/Paris"
});

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

    let compileId = randomId();
    let fileName = generateBinFileName(jsonConfig);

    compile(clientId, compileId, jsonConfig, fileName);
});

// Route compile multiple
app.post('/compile-multiple', async (req, res) => {
    clientId = req.body.clientId;
    jsonConfig = req.body.formData;

    sendLogToClient(clientId, 'Compilation is starting...')

    let compileId = randomId();
    let zipName = generateMultipleCompileFileName(jsonConfig.length, jsonConfig[0]);
    let zipPath = `/${volName}/results/${compileId}.zip`;
    compileMultiple(clientId, compileId, jsonConfig, zipName, zipPath);
});

// Download the result for the compileId
// Type = single or multiple
app.get('/download', async (req, res) => {
    const { id, type, filename } = req.query;

    if (!id || !type || !filename) {
        return res.status(400).send({
            status: 400,
            error: 'Bad Request',
            message: 'Missing required query parameters: id, type, or filename'
        });
    }

    let filePath = '';
    if(type === 'multiple') {
        filePath = `/${volName}/results/${id}.zip`;
    } else if (type === 'single') {
        filePath = `/${volName}/results/${id}/${filename}`;
    } else {
        return res.status(400).send({
            status: 400,
            error: 'Bad Request',
            message: 'Invalid type. Expected "single" or "multiple".'
        });
    }

    res.setHeader('X-File-Name', filename);
    res.download(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(404).send({
                status: 404,
                error: 'Not found',
                message: 'File not found'
            });
        }
    });
});

/* INIT */

const server = http.createServer(app);
initSocket(server, containerIdMap);

// Start server on port 4050
server.listen(port, () => {
    console.log(`HTTP server running at http://localhost:${port}`);
});

initSharedVolume(volName);