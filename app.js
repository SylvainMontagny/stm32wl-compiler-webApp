const express = require('express');
const path = require('path');
const fs = require('fs');
const { dockerfunctions, createContainer, startCompilerContainer } = require('./docker/dockerfunctions');

const app = express();
const port = process.env.PORT || 4050;

app.use(express.json());

// Public static link
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route compile
app.post('/compile', (req, res) => {
    const formData = req.body;
    console.log(formData);

    //simulate compilation
    setTimeout(() => {
        fs.readFile(path.join(__dirname, `../../../results/15/STM32WL-standalone.bin`), 'utf8', (err, data) => {

            // Send file
            res.download(path.join(__dirname, `../../../results/15/STM32WL-standalone.bin`), (err) => {
                if (err) {
                    return res.status(500).send('Error sending file');
                }
            });
        });
    }, 2000);

});


// Start serveur on port 4050
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});