const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
var stream = require('stream');
const fs = require('fs-extra');

//keys to set into General_Setup.h
const generalSetupKeys = ["ADMIN_SENSOR_ENABLED", "MLR003_SIMU", "MLR003_APP_PORT", "ADMIN_GEN_APP_KEY"]

const imageName = 'montagny/arm-compiler:1.0' // image of the compiler
const volName = 'shared-vol' // name of the volume used to store configs and results
const compiledFile = 'STM32WL-standalone.bin' // compiled file name
const compilerPath = '/STM32WL' // Path to the STM32WL compiler files
const generalSetupPath = process.env.General_Setup_path;
const configApplicationPath = process.env.config_application_path;

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

async function modifyHFile(source,jsonConfig){
    try {
        // Read async
        let data = await fs.readFile(source, 'utf8');
        let modifiedData = data;

        for (let [key, value] of Object.entries(jsonConfig)) {
            // Special case : { 0x00, ... }
            if(key == "devEUI_" || key == "appEUI_"){
                let regex = new RegExp(`(#define ${key}\\s+{ ).+[0-9]`,'m');
                modifiedData = modifiedData.replace(regex,`$1${value}`);
            // Special case : ( uint32_t )0x00...
            } else if(key == "devAddr_"){
                let regex = new RegExp(`(#define ${key}\\s+.*)0x[0-9]+`,'m')
                modifiedData = modifiedData.replace(regex,`$1${value}`);
            // Default case
            } else {
                let regex = new RegExp(`(#define ${key}\\s+)[a-zA-Z0-9_,]+`,'m');
                modifiedData = modifiedData.replace(regex,`$1${value}`);
            }
        }
        // Write changes to file
        await writeFileAsync(source, modifiedData);
    } catch (err) {
        console.error(`Error reading or writing in file : ${err}`);
    }
}

async function copyDir(source, destination) {
    console.log(`Copying STM32WL to ${destination}`)
    try {
      await fs.copy(source, destination);
    } catch (err) {
      console.error('Error copying files : ', err);
    }
  }

function randomId() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 5; i++) {
        id += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return id;
}
async function initSharedVolume() {
    console.log(`Initiating shared volume ${volName}`)
    try {
        await fs.mkdir(`/${volName}/configs`, { recursive: true });
        console.log(`Init : configs folder created or already there`);
        await fs.mkdir(`/${volName}/results`, { recursive: true });
        console.log(`Init : results folder created or already there`);
    } catch (err) {
        console.error(`Error initiating shared volume '${volName}':`, err);
    }
}

async function setupFiles(configPath,resultPath,jsonConfigApplication,jsonGeneralSetup){
    // Creating folders
    await createDir(configPath)
    await createDir(resultPath)

    // Copy compiler files
    await copyDir(compilerPath,configPath);
    
    // Modify .h files with json
    await modifyHFile(`${configPath}${configApplicationPath}/config_application.h`,jsonConfigApplication);
    await modifyHFile(`${configPath}${generalSetupPath}/General_Setup.h`,jsonGeneralSetup);
}

async function createDir(dir) {
    try {
        await fs.access(dir);
        console.log(`Folder already exist : ${dir}`);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.mkdir(dir, { recursive: true });
        } else {
            console.error(`Error verrifying file : ${err}`);
        }
    }
}

async function deleteDir(path) {
    try {
      await fs.remove(path);
      console.log(`${path} directory removed`);
    } catch (err) {
      console.error(`Error suppressing ${path} directory :`, err);
    }
  }

async function writeFileAsync(source, modifiedData) {    
    try {
        await fs.writeFile(source, modifiedData);
        console.log(`${source} modified`)
    } catch (err) {
        console.error(`Error writing in file : ${err}`);
    }
}

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
    initSharedVolume,
    randomId,
    volName,
    compiledFile
};