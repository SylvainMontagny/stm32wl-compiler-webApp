const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');

const fs = require('fs');
const { dockerfunctions, initSharedVolume, compile, randomId, volName, compiledFile } = require('./docker/dockerfunctions');

const app = express();
const port = process.env.PORT || 4050;

// Public static link
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

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

const server = http.createServer(app);
const io = require('./socket')(server);

// Start serveur on port 4050
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// initSharedVolume();