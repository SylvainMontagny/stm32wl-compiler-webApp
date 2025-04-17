const Docker = require("dockerode");
const docker = new Docker({ socketPath: "/var/run/docker.sock" });
var stream = require("stream");
const { sendLogToClient } = require("../sockets/socketInstance");
const {
  generateBinFileName,
  setupFiles,
  deleteDir,
  setupFilesMulti,
  zipDirectory,
} = require("./file_fct.js");

//keys to set into General_Setup.h
const generalSetupKeys = [
  "ADMIN_SENSOR_ENABLED",
  "USMB_VALVE",
  "ADMIN_GEN_APP_KEY",
  "ATIM_THAQ",
  "WATTECO_TEMPO",
  "TCT_EGREEN",
];

const imageName = "montagny/arm-compiler:1.0"; // image of the compiler
const volName = "shared-vol"; // name of the volume used to store configs and results
const compiledFile = "STM32WL-standalone.bin"; // compiled file name

const containerIdMap = {};

/**
 * Generate a random compileId for the compiling process
 * With 5 characters/numbers
 */
function randomId() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
}

/**
 * Compile main function used through API
 */
async function compile(clientId, compileId, jsonConfig, fileName) {
  console.log(`Compiling with id : ${compileId}`);
  let configPath = `/${volName}/configs/${compileId}`; // Path for compiler files
  let resultPath = `/${volName}/results/${compileId}`; // Path for .bin compiled files

  // Split input json for the 2 config files
  // Put General_Setup.h keys in separate json

  if (
    !validateLoRaWANKeys(clientId, jsonConfig) ||
    !validateGeneralConfig(clientId, jsonConfig)
  ) {
    console.error("Invalid configuration, stopping compilation.");
    sendLogToClient(clientId, "Invalid configuration, stopping compilation.");
    return 404;
  }

  jsonConfigApplication = jsonConfig;
  jsonGeneralSetup = {};
  for (let key of generalSetupKeys) {
    jsonGeneralSetup[key] = jsonConfigApplication[key];
    delete jsonConfigApplication[key];
  }

  // Create folders, copy compiler files and modify .h files
  let setupSuccess = await setupFiles(
    configPath,
    resultPath,
    jsonConfigApplication,
    jsonGeneralSetup,
    compileId,
    clientId
  );
  if (!setupSuccess) {
    console.log(`Compilation aborted due to missing keys.`);
    return;
  }

  // Start Compiling
  let status = await startCompilerContainer(
    compileId,
    configPath,
    resultPath,
    fileName,
    clientId
  );
  if (status == 0) {
    console.log(`Compiled successfully : ${compileId}`);
  } else if (status == 137) {
    console.log(`Compiling stopped successfully : ${compileId}`);
  } else {
    console.log(`Error while compiling : ${compileId}`);
  }
  delete containerIdMap[compileId];

  // Clean up : Remove compiler files
  await deleteDir(configPath);

  return status;
}

async function compileMultiple(clientId, multipleCompileId, jsonArrayConfig) {
  console.log(`Multiple compilation id : ${multipleCompileId}`);
  let resultPath = `/${volName}/results/${multipleCompileId}`; // Path for .zip with .bin and .csv files
  let configPath = `/${volName}/configs`; // Path for all compiler files

  for (let jsonConfig of jsonArrayConfig) {
    if (
      !validateLoRaWANKeys(clientId, jsonConfig) ||
      !validateGeneralConfig(clientId, jsonConfig)
    ) {
      console.error("Invalid configuration, stopping compilation.");
      sendLogToClient(clientId, "Invalid configuration, stopping compilation.");
      return 404;
    }
  }

  // JSON with compiler ID as key and splitted json as value
  let jsonIdsConfig = [];
  jsonArrayConfig.forEach((element) => {
    let jsonConfig = {};
    // Split input json for the 2 config files
    // Put General_Setup.h keys in separate json
    let jsonConfigApplication = element;
    let jsonGeneralSetup = {};
    for (let key of generalSetupKeys) {
      jsonGeneralSetup[key] = jsonConfigApplication[key];
      delete jsonConfigApplication[key];
    }

    // Put them in jsonIdsConfig at randomId
    // Also adds the .bin fileName for compilation
    jsonConfig.configApplication = jsonConfigApplication;
    jsonConfig.generalSetup = jsonGeneralSetup;
    jsonConfig.fileName = generateBinFileName(element);
    jsonIdsConfig[randomId()] = jsonConfig;
  });
  let setupSuccess = await setupFilesMulti(
    configPath,
    resultPath,
    jsonIdsConfig,
    clientId
  );

  if (!setupSuccess) {
    console.log(`Compilation aborted due to missing keys.`);
    return;
  }

  // Compilation
  let status = 0;
  for (let id in jsonIdsConfig) {
    status = await startCompilerContainer(
      id,
      `${configPath}/${id}`,
      resultPath,
      jsonIdsConfig[id].fileName,
      clientId
    );
    if (status == 0) {
      console.log(`Compiled successfully : ${id}`);
    } else if (status == 137) {
      console.log(`Compiling stopped successfully : ${multipleCompileId}`);
      break;
    } else {
      console.log(`Error while compiling : ${id}`);
      break;
    }
  }

  // Clean up : Remove compiler files
  for (let id in jsonIdsConfig) {
    await deleteDir(`${configPath}/${id}`);
    delete containerIdMap[id];
  }

  // Zip file
  if (status == 0) {
    await zipDirectory(resultPath, `${resultPath}.zip`);
  }
  return status;
}

/**
 * Starts the compiler container with Dockerode
 * Execute the CMD and deletes itself
 * Return the status of the container execution
 * 0 if everything went well
 */
async function startCompilerContainer(
  compileId,
  configPath,
  resultPath,
  fileName,
  clientId
) {
  try {
    // Start compiler with custom CMD
    const container = await docker.createContainer({
      Image: imageName, // Compiler image
      HostConfig: {
        Binds: [`${volName}:/${volName}`], // Volume that stores configs and results data
      },
      // Move to compiler, make, and then put .bin into resultpath with new name
      Cmd: [
        `/bin/bash`,
        `-c`,
        `cd ..${configPath} && make && mv ${compiledFile} ${resultPath}/${fileName}`,
      ],
    });

    containerIdMap[compileId] = container.id;

    // Start container
    await container.start();
    console.log(`Container started: ${container.id}`);

    // Handle logs
    containerLogs(compileId, container, clientId);

    // Wait for the container to stop
    const waitResult = await container.wait();
    console.log("Container stopped with status:", waitResult.StatusCode);

    // Clean up: remove the container
    await container.remove({ force: true });
    console.log("Container removed");

    // Return if the container had an error or not
    return waitResult.StatusCode;
  } catch (error) {
    console.error("Error starting container :", error);
  }
}

/**
 * Handle Container Logs
 * Display them on console.log with the compileId first
 */
function containerLogs(compileId, container, clientId) {
  // Create a single stream for stdin and stdout
  var logStream = new stream.PassThrough();
  logStream.on("data", function (chunk) {
    let str = chunk.toString("utf8");
    if (str != " \n") {
      const logMessage = `[${compileId}] ${str}`;
      sendLogToClient(clientId, logMessage);
      process.stdout.write(logMessage);
    }
  });
  container.logs(
    {
      follow: true,
      stdout: true,
      stderr: true,
    },
    function (err, stream) {
      if (err) {
        return process.stderr.write(err.message);
      }
      container.modem.demuxStream(stream, logStream, logStream);
      stream.on("end", function () {
        stream.destroy();
      });
    }
  );
}

/**
  Validate the length of LoRaWAN keys
 */
function validateLoRaWANKeys(clientId, config) {
  const expectedLengths = {
    devEUI_: 8,
    appKey_: 16,
    appEUI_: 8,
    devAddr_: 1,
    nwkSKey_: 16,
    appSKey_: 16,
    ADMIN_GEN_APP_KEY: 16,
  };

  for (const key in expectedLengths) {
    if (!config[key]) {
      let msg = `${key} is missing in the configuration.`;
      sendLogToClient(clientId, msg);
      return false;
    }
    let bytes = config[key].split(",").map((byte) => byte.trim());
    if (bytes.length !== expectedLengths[key]) {
      let msg = `${key} must contain ${expectedLengths[key]} bytes, but contains ${bytes.length}`;
      sendLogToClient(clientId, msg);
      return false;
    }
  }
  return true;
}

/**
 Validate general configuration keys
 */
function validateGeneralConfig(clientId, config) {
  const keyTypes = {
    boolean: [
      "ADAPTIVE_DR",
      "CONFIRMED",
      "SEND_BY_PUSH_BUTTON",
      "PAYLOAD_1234",
      "PAYLOAD_TEMPERATURE",
      "PAYLOAD_HUMIDITY",
      "LOW_POWER",
      "CAYENNE_LPP_",
      "ADMIN_SENSOR_ENABLED",
      "TCT_EGREEN",
      "USMB_VALVE",
      "ATIM_THAQ",
      "WATTECO_TEMPO",
    ],
    string: ["ACTIVATION_MODE", "CLASS", "SPREADING_FACTOR"],
    number: ["APP_PORT", "FRAME_DELAY"],
  };

  for (const key of keyTypes.boolean) {
    if (
      !(key in config) ||
      (config[key] !== "true" && config[key] !== "false")
    ) {
      let msg = `${key} must be 'true' or 'false'.`;
      console.error(msg);
      sendLogToClient(clientId, msg);
      return false;
    }
  }

  for (const key of keyTypes.string) {
    if (!(key in config) || typeof config[key] !== "string") {
      let msg = `${key} must be a string.`;
      console.error(msg);
      sendLogToClient(clientId, msg);
      return false;
    }
  }

  for (const key of keyTypes.number) {
    if (!(key in config) || isNaN(parseInt(config[key], 10))) {
      let msg = `${key} must be a valid number.`;
      console.error(msg);
      sendLogToClient(clientId, msg);
      return false;
    }
  }
  return true;
}

module.exports = {
  randomId,
  compile,
  compileMultiple,
  volName,
  compiledFile,
  containerIdMap,
};
