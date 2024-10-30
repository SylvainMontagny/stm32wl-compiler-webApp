const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
var stream = require('stream');
const { setupFiles, deleteDir, setupFilesMulti } = require('./file_fct.js');

//keys to set into General_Setup.h
const generalSetupKeys = ["ADMIN_SENSOR_ENABLED", "MLR003_SIMU", "MLR003_APP_PORT", "ADMIN_GEN_APP_KEY"]

const imageName = 'montagny/arm-compiler:1.0' // image of the compiler
const volName = 'shared-vol' // name of the volume used to store configs and results
const compiledFile = 'STM32WL-standalone.bin' // compiled file name

/**
 * Compile main function used through API
 */
async function compile(compileId,jsonConfig) {
    console.log(`Compiling with id : ${compileId}`)
    let configPath = `/${volName}/configs/${compileId}` // Path for compiler files
    let resultPath = `/${volName}/results/${compileId}` // Path for .bin compiled files

    // Split input json for the 2 config files
    // Put General_Setup.h keys in separate json
    jsonConfigApplication = jsonConfig;
    jsonGeneralSetup = {};
    for (let key of generalSetupKeys) {
        jsonGeneralSetup[key] = jsonConfigApplication[key];
        delete jsonConfigApplication[key];
    }

    // Create folders, copy compiler files and modify .h files
    await setupFiles(configPath,resultPath,jsonConfigApplication,jsonGeneralSetup);

    // Start Compiling
    let status = await startCompilerContainer(compileId,configPath,resultPath)
    if(status == 0){
        console.log(`Compiled successfully : ${compileId}`)
    } else {
        console.log(`Error while compiling : ${compileId}`)
    }
    
    // Clean up : Remove compiler files
    await deleteDir(configPath);

    return status;
}

async function compileMultiple(multipleCompileId, jsonConfig){
    console.log(`Multiple compilation id : ${multipleCompileId}`)
    let resultPath = `/${volName}/results/${multipleCompileId}` // Path for .zip with .bin and .csv files

    setupFilesMulti(resultPath,jsonConfig)
    return 0;
}

/**
 * Generate a random compileId for the compiling process
 * With 5 characters/numbers
 */
function randomId() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 5; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
}

/**
 * Starts the compiler container with Dockerode
 * Execute the CMD and deletes itself
 * Return the status of the container execution
 * 0 if everything went well
 */
async function startCompilerContainer(compileId,configPath, resultPath){
    try {
        // Start compiler with custom CMD
        const container = await docker.createContainer({
            Image: imageName, // Compiler image
            HostConfig: {
                Binds: [`${volName}:/${volName}`] // Volume that stores configs and results data
            },
            // Move to compiler, make, and then put .bin into resultpath
            Cmd: [`/bin/bash`, `-c`, `cd ..${configPath} && make && mv ${compiledFile} ${resultPath}`]
        });

        // Start container
        await container.start();
        console.log(`Container started: ${container.id}`);

        // Handle logs
        containerLogs(compileId,container);

        // Wait for the container to stop
        const waitResult = await container.wait();
        console.log('Container stopped with status:', waitResult.StatusCode);

        // Clean up: remove the container
        await container.remove({ force: true });
        console.log("Container removed");

        // Return if the container add an error or not
        return waitResult.StatusCode

    } catch (error) {
        console.error('Error starting container :', error);
    }
}

/**
 * Handle Container Logs
 * Display them on console.log with the compileId first
 */
function containerLogs(compileId,container) {
    // Create a single stream for stdin and stdout
    var logStream = new stream.PassThrough();
    logStream.on('data', function (chunk) {
        process.stdout.write(`[${compileId}] ${chunk.toString('utf8')}`);
    });

    container.logs({
        follow: true,
        stdout: true,
        stderr: true
    }, function (err, stream) {
        if (err) {
            return process.stderr.write(err.message);
        }
        container.modem.demuxStream(stream, logStream, logStream);
        stream.on('end', function () {
            stream.destroy();
        });
    });
}

module.exports = {
    compile,
    compileMultiple,
    randomId,
    volName,
    compiledFile
};