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
    "FRAME_DELAY": "10000",
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

const imageName = 'stm32wl' //image of the compiler
const volName = 'shared-vol' //name of the volume used to store configs and results

async function compile(jsonConfig) {
    let id_random = randomId()
    console.log(`Compiling with id : ${id_random}`)
    let configPath = `/${volName}/configs/${id_random}` // Path for .h files for compiling
    let resultPath = `/${volName}/results/${id_random}` // Path for .bin compiled files

    // Split input json for the 2 config files
    // Put General_Setup.h keys in separate json
    jsonAppSetup = jsontest;
    jsonGenSetup = {};
    for (let key of generalSetupKeys) {
        jsonGenSetup[key] = jsonAppSetup[key];
        delete jsonAppSetup[key];
    }

    // Create folders, move and rename templates
    await setupFiles(id_random,configPath,resultPath);
    // Modify .h files with json
    await modifyHFile(`${configPath}/config_application.h`,jsonAppSetup)
    await modifyHFile(`${configPath}/General_Setup.h`,jsonGenSetup)
    // Start Compiling
    let status = await startCompilerContainer(configPath,resultPath)
    if(status == 0){
        console.log(`Compiled successfully : ${id_random}`)
    } else {
        console.log(`Error while compiling : ${id_random}`)
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

async function modifyHFile(source, jsonConfig) {
    try {
        // Read async
        let data = await fs.readFile(source, 'utf8');
        let modifiedData = data;
        
        for (let [key, value] of Object.entries(jsonConfig)) {
            const regex = new RegExp(`<${key}>`);
            modifiedData = modifiedData.replace(regex,value);
        }
        // Write changes to file
        await writeFileAsync(source, modifiedData);
    } catch (err) {
        console.error(`Error reading or writing in file : ${err}`);
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
    const compiledFile = 'STM32WL-standalone.bin'
    try {
        // Start compiler with custom CMD
        const container = await docker.createContainer({
            Image: imageName, // Compiler image
            HostConfig: {
                Binds: [`${volName}:/${volName}`] // Volume that stores configs and results data
            },
            // Move configs files to /config, make, and then put .bin into resultpath
            Cmd: [`/bin/bash`, `-c`, `mv ${configPath}/config_application.h ${configPath}/General_Setup.h config/ && make && mv ${compiledFile} ${resultPath}`]
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
        console.log(chunk.toString('utf8'));
    });

    container.logs({
        follow: true,
        stdout: true,
        stderr: true
    }, function (err, stream) {
        if (err) {
            return console.error(err.message);
        }
        container.modem.demuxStream(stream, logStream, logStream);
        stream.on('end', function () {
            stream.destroy();
        });
    });
}

module.exports = {
    compile,
    initSharedVolume
};