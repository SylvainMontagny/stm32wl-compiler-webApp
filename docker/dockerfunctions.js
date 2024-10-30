const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const path = require('path');
var stream = require('stream');
const fs = require('fs').promises;
const fse = require('fs-extra');

//keys to set into General_Setup.h
const generalSetupKeys = ["ADMIN_SENSOR_ENABLED", "MLR003_SIMU", "MLR003_APP_PORT", "ADMIN_GEN_APP_KEY"]

const imageName = 'montagny/arm-compiler:1.0' // image of the compiler
const volName = 'shared-vol' // name of the volume used to store configs and results
const compiledFile = 'STM32WL-standalone.bin' // compiled file name
const generalSetupPath = process.env.General_Setup_path;
const configApplicationPath = process.env.config_application_path;

async function compile(id,jsonConfig) {
    console.log(`Compiling with id : ${id}`)
    let configPath = `/${volName}/configs/${id}` // Path for compiler files
    let resultPath = `/${volName}/results/${id}` // Path for .bin compiled files

    // Split input json for the 2 config files
    // Put General_Setup.h keys in separate json
    jsonConfigApplication = jsonConfig;
    jsonGeneralSetup = {};
    for (let key of generalSetupKeys) {
        jsonGeneralSetup[key] = jsonConfigApplication[key];
        delete jsonConfigApplication[key];
    }

    // Create folders and copy compiler files
    await setupFiles(id,configPath,resultPath);
    await copyDir("/STM32WL",configPath);
    // Modify .h files with json
    await modifyHFile(`${configPath}${generalSetupPath}/General_Setup.h`,jsonGeneralSetup);
    await modifyHFile(`${configPath}${configApplicationPath}/config_application.h`,jsonConfigApplication);
    // Start Compiling
    let status = await startCompilerContainer(configPath,resultPath)
    if(status == 0){
        console.log(`Compiled successfully : ${id}`)
    } else {
        console.log(`Error while compiling : ${id}`)
    }
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
      await fse.copy(source, destination);
    } catch (err) {
      console.error('Error copying files : ', err);
    }
  }

function randomId() {
    let min = 10 ** 14;
    let max = 10 ** 15;
    let id_random = (Math.floor(Math.random() * (max - min)) + min).toString();
    return id_random.toString()
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

async function setupFiles(id_random,configPath,resultPath){
    // Templates
    const sourceConfigAppTemp = `./templates/config_application_template.h`
    const sourceConfigGenTemp = `./templates/General_Setup_template.h`

    // Creating folders
    await createDir(configPath)
    await createDir(resultPath)
    // Moving templates
    await copyFile(sourceConfigAppTemp, configPath)
    await copyFile(sourceConfigGenTemp, configPath)
    // Renaming templates
    await renameFile(`${configPath}/config_application_template.h`,`${configPath}/config_application.h`)
    await renameFile(`${configPath}/General_Setup_template.h`,`${configPath}/General_Setup.h`)
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

async function copyFile(source, destination) {
    let fileName = path.basename(source); // Get file name
    let destPath = path.join(destination, fileName); // Get full path

    try {
        await fs.copyFile(source, destPath);
    } catch (err) {
        console.error('Error copying file :', err);
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

async function renameFile(source, destination) {
    try {
        await fs.rename(source, destination);
    } catch (err) {
        console.error('Error renaming file :', err);
    }
    return destination; 
}

async function startCompilerContainer(configPath, resultPath){
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

        // Display logs
        containerLogs(container);

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

function containerLogs(container) {
    // Create a single stream for stdin and stdout
    var logStream = new stream.PassThrough();
    logStream.on('data', function (chunk) {
        process.stdout.write(chunk.toString('utf8'));
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