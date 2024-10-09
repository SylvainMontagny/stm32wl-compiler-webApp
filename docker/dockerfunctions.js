const Docker = require('dockerode');
const docker = new Docker();
var stream = require('stream');

jsonTest = ["ACTIVATION_MODE" = "OTAA","CLASS" = "CLASS_A"]

//libraire fs
function compile(jsonConfig){
    //1.Generer un id random
    // id = random(15)
    // id = 4382592

    //2.creer configs/4382592 et results/4382592

    //3.creer une copie de General_Setup_template.h et application_config_template.h dans configs/4382592

    //4.modifie les deux avec les paramètres du json
    //format du json [ "ACTIVATION_MODE" = "OTAA", ...]
    //ouvrir le fichier template, faire regex de {KEY} -> value

    //5. enlever _template dans le nom

    //6. appeler la fonction startCompiler(id) (pas pour le moment)
}

// Display container logs on console.log
function containerLogs(container) {

    // create a single stream for stdin and stdout
    var logStream = new stream.PassThrough();
    logStream.on('data', function(chunk){
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
    });

    setTimeout(function() {
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
        await container.start({}, function(err, data) {
            containerLogs(container);
        });
        console.log(`Conteneur démarré : ${container.id}`);


        } catch (error) {
            console.error('Erreur lors de la création ou du démarrage du conteneur :', error);
        }
}

module.exports = {
    createContainer,
};