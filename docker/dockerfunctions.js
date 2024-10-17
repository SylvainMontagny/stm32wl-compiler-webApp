const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const path = require('path');
var stream = require('stream');

const fs = require('fs-extra');

//jsonTest = ["ACTIVATION_MODE" : "OTAA","CLASS" : "CLASS_A"]

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

async function startCompilerContainer(id){
    try {
        // Create container
        const container = await docker.createContainer({
        Image: 'stm32wl', // Compiler image
        HostConfig: {
            Binds: [
            `/srv/configs/${id}:/workspace/config`, // Config folder
            `/srv/results/${id}:/result`            // Config folder
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
        stream.destroy();
    });

    });
}

module.exports = {
    startCompilerContainer
};