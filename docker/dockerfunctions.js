const Docker = require('dockerode');
const docker = new Docker();
var stream = require('stream');
const path = require('path');
const fs = require('fs').promises;

async function compile(jsonConfig) {
    const id_random = randomId()
    console.log("fichier id : " + id_random)
    await createRepoDirs(id_random)
    processCFile(id_random, jsonConfig)
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

async function processCFile(id_random, jsonConfig) {
    await addCFiles(id_random)  
    const source = await renameCFile(id_random)
    await modifyCFile(source, jsonConfig); 
}

async function addCFiles(id_random) {
    const sourceConfigAppTemp = `./templates/config_application_template.h`
    const sourceConfigGenTemp = `./templates/General_Setup_template.h`
    await copyFile(sourceConfigAppTemp, './configs/' + id_random)
    copyFile(sourceConfigGenTemp, './configs/' + id_random)
}

async function modifyCFile(source, jsonConfig) {
    try {
        // Lire le fichier de manière asynchrone
        let data = await fs.readFile(source, 'utf8');
        let modifiedData = data;

        for (const key in jsonConfig) {
            const value = jsonConfig[key];
            if (key === "devAddr_") {
                const devAddrRegex = new RegExp(`(#define\\s+${key}\\s+)(\\(\\s*uint32_t\\s*\\)\\s*)(0x[0-9a-fA-F]+)`, 'g');
                modifiedData = modifiedData.replace(devAddrRegex, `$1$2${value}`);
            } else {
                const regex = new RegExp(`(#define\\s+${key}\\s+)(\\{[^}]*\\}|[^\\s]+)`, 'g');
                modifiedData = modifiedData.replace(regex, `$1${value}`);
            }
        }

        // Ajout des accolades pour devEUI_ et appEUI_
        const euiRegex = new RegExp(`(#define\\s+(devEUI_|appEUI_)\\s+)([0-9a-fA-Fx,\\s]+)`, 'g');
        modifiedData = modifiedData.replace(euiRegex, (match, p1, p2, p3) => {
            // Nettoyage des valeurs et ajout des accolades
            const cleanedValues = p3.trim().replace(/\s*\n\s*/g, '');
            return `${p1}{ ${cleanedValues} }\n\n`; // Ajout d'une ligne vide après modification
        });

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

async function renameCFile(id_random) {
    const source = `./configs/${id_random}/config_application_template.h`;
    const destination = `./configs/${id_random}/config_application.h`;
    try {
        await fs.rename(source, destination);
    } catch (err) {
        console.error('Erreur lors du renommage du fichier :', err);
    }
    return destination; 
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
    }, function (err, stream) {
        if (err) {
            return logger.error(err.message);
        }
        container.modem.demuxStream(stream, logStream, logStream);
        stream.on('end', function () {
            container.remove({ force: true });
            console.log("Stopped container");
        });

        setTimeout(function () {
            stream.destroy();
        }, 2000);
    });
}

async function createContainer() {
    try {
        // Création du conteneur
        const container = await docker.createContainer({
            Image: 'hello-world', // L'image à utiliser pour le conteneur
            HostConfig: {
                Binds: [
                    '/var/run/docker.sock:/var/run/docker.sock' // Montée du socket Docker
                ]
            }
        });

        // Démarrage du conteneur
        await container.start({}, function (err, data) {
            containerLogs(container);
        });
        console.log(`Conteneur démarré : ${container.id}`);


    } catch (error) {
        console.error('Erreur lors de la création ou du démarrage du conteneur :', error);
    }
}

module.exports = {
    createContainer, compile
};