const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const path = require('path');
var stream = require('stream');
const fs = require('fs').promises;

let jsontest = {
    "ACTIVATION_MODE": "OTAA",
    "CLASS": "CLASS_A",
    "SPREADING_FACTOR": "7",
    "ADAPTIVE_DR": "false",
    "CONFIRMED": "false",
    "APP_PORT": "15",
    "SEND_BY_PUSH_BUTTON": "false",
    "FRAME_DELAY": "10",
    "PAYLOAD_HELLO": "true",
    "PAYLOAD_TEMPERATURE": "false",
    "PAYLOAD_HUMIDITY": "false",
    "LOW_POWER": "false",
    "CAYENNE_LPP_": "false",
    "devEUI_": "0xdc, 0x70, 0x22, 0x0a, 0x80, 0xa6, 0x4e, 0x9d",
    "appKey_": "55,1F,E3,F0,4F,80,AC,31,46,F5,B7,F5,D9,21,D3,B3",
    "appEUI_": "0x67, 0xc3, 0xfe, 0xcd, 0xc4, 0x56, 0x5b, 0xab",
    "devAddr_": "0x5854ccbd",
    "nwkSKey_": "81,1c,9a,89,e7,d5,bb,22,7e,94,af,34,22,c1,d9,5e",
    "appSKey_": "97,1f,b0,fc,cd,2b,59,4e,5c,1b,32,1d,80,2f,9a,08",
    "ADMIN_SENSOR_ENABLED": "false",
    "MLR003_SIMU": "false",
    "MLR003_APP_PORT": "30",
    "ADMIN_GEN_APP_KEY": "e1,7f,e1,5a,f6,80,1d,16,d0,34,ea,59,ad,2a,4e,f5"
};

//keys to set into General_Setup.h
const generalSetupKeys = ["ADMIN_SENSOR_ENABLED", "MLR003_SIMU", "MLR003_APP_PORT", "ADMIN_GEN_APP_KEY"]

async function compile() {
    // put General_Setup.h keys in separate json
    jsonAppSetup = jsontest;
    jsonGenSetup = {};
    for (let key of generalSetupKeys) {
        jsonGenSetup[key] = jsonAppSetup[key];
        delete jsonAppSetup[key];
    }
    console.log(jsonAppSetup);
    console.log(jsonGenSetup);

    const id_random = randomId()
    console.log("fichier id : " + id_random)
    await createRepoDirs(id_random)
    processHFile(id_random, jsonAppSetup)
}

function randomId() {
    const min = 10 ** 14;
    const max = 10 ** 15;
    const id_random = (Math.floor(Math.random() * (max - min)) + min).toString();
    return id_random.toString()
}

async function createRepoDirs(id_random) {
    await createDir('./configs', id_random)
    createDir('./results', id_random)
}

async function processHFile(id_random, jsonConfig) {
    await addHFiles(id_random);
    const source = await renameHFile(id_random);
    await modifyHFile(source, jsonConfig); 
}

async function createDir(parentDir, id) {
    const newDir = path.join(parentDir, id);
    try {
        await fs.access(newDir);
        console.log('Le dossier existe déjà:', newDir);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.mkdir(newDir, { recursive: true });
        } else {
            console.error(`Erreur lors de la vérification du dossier: ${err}`);
        }
    }
}

async function addHFiles(id_random) {
    const sourceConfigAppTemp = `./templates/config_application_template.h`
    const sourceConfigGenTemp = `./templates/General_Setup_template.h`
    await copyFile(sourceConfigAppTemp, './configs/' + id_random)
    copyFile(sourceConfigGenTemp, './configs/' + id_random)
}

async function modifyHFile(source, jsonConfig) {
    try {
        // Lire le fichier de manière asynchrone
        let data = await fs.readFile(source, 'utf8');
        let modifiedData = data;
        
        for (let [key, value] of Object.entries(jsonConfig)) {
            const regex = new RegExp(`<${key}>`);
            modifiedData = modifiedData.replace(regex,value);
        }
        // Écrire les changements dans le fichier
        await writeFileAsync(source, modifiedData);
    } catch (err) {
        console.error(`Erreur lors de la lecture ou l'écriture du fichier : ${err}`);
    }
}

async function copyFile(source, destination) {
    const fileName = path.basename(source); // Récupérer le nom du fichier
    const destPath = path.join(destination, fileName); // Créer le chemin de destination complet

    try {
        await fs.copyFile(source, destPath);
    } catch (err) {
        console.error('Erreur lors de la copie du fichier:', err);
    }
}

async function writeFileAsync(source, modifiedData) {    
    try {
        await fs.writeFile(source, modifiedData);
        console.log("modifié")
    } catch (err) {
        console.error(`Erreur lors de l'écriture du fichier: ${err}`);
    }
}

async function renameHFile(id_random) {
    const source = `./configs/${id_random}/config_application_template.h`;
    const destination = `./configs/${id_random}/config_application.h`;
    try {
        await fs.rename(source, destination);
    } catch (err) {
        console.error('Erreur lors du renommage du fichier :', err);
    }
    return destination; 
}

const volumepath = '/home' // path where configs and results should be stored

async function startCompilerContainer(id){
    try {
        // Create container
        const container = await docker.createContainer({
        Image: 'stm32wl', // Compiler image
        HostConfig: {
            Binds: [
            `${volumepath}/configs/${id}:/workspace/config`, // Config folder
            `${volumepath}/results/${id}:/result`            // Result folder
            ]
        }
        });

        // Start container and display logs
        await container.start({}, function(err, data) {
            containerLogs(container);
        });
        console.log(`Container started : ${container.id}`);


    } catch (error) {
        console.error('Error starting container :', error);
    }
}

// Display container logs on console.log
function containerLogs(container) {
    // create a single stream for stdin and stdout
    var logStream = new stream.PassThrough();
    logStream.on('data', function (chunk) {
        console.log(chunk.toString('utf8'));
    });

    container.logs({
    follow: true,
    stdout: true,
    stderr: true
    }, function(err, stream){
    if(err) {
        return logger.error(err.message);
    }
    container.modem.demuxStream(stream, logStream, logStream);
    stream.on('end', function(){
        container.remove({ force: true });
        console.log("Stopped container");
        stream.destroy();
    });

    });
}

module.exports = {
    //startCompilerContainer
    compile
};