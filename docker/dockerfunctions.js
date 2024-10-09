const Docker = require('dockerode');
const docker = new Docker();
var stream = require('stream');


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