# LoRaWAN Compiler Webapp

**LoRaWAN Compiler Webapp** is a containerized web application that allows code compilation by launching containers via a POST Express API. It is designed to manage and isolate compilation environments securely and efficiently, making it easy to execute compilers on demand. This application is meant to be used alongside STM32WL-standalone source files, and an arm-compiler image.

## Requirement

- [Docker](https://www.docker.com/)

## Installation and Setup

### Server Setup

To setup the webapp, you will need a few steps :

1. Clone the STM32WL and Webapp Git

```shell
git clone https://github.com/SylvainMontagny/stm32wl-compiler-webApp.git
git clone https://github.com/elias-qzo/LoRaWAN-Compiler-Webapp.git
```

2. Start the Webapp container

```shell
cd LoRaWAN-Compiler-Webapp
docker compose up -d --build
```
This will build the Docker image of the repo and start it.\
You can remove the -d if you want to see logs in real time.\
By default, the STM32WL-standalone path is set to *../STM32WL/STM32WL-standalone*. To use another path, copy the *.env.example* to *.env* file, and add your path into it :
```
cp .env.example .env
``` 
```makefile
STM32WL_PATH=/your/path/here
```

3. Stop the containers

```shell
docker compose down
```

### Usage, process overview and libraries used

**Step 1:** Start the main web app container using docker compose.
```shell
docker compose up
```
Here is the *docker-compose.yml* used :
```yml
services:
  compiler-web:
    build: . # Docker build current folder
    image: lorawan-compiler-webapp # Webapp image
    ports:
      - "4050:4050" # Webapp port
    volumes:
      - shared-vol:/shared-vol # Volume to share data across containers
      - ${STM32WL_PATH:-../STM32WL/STM32WL-standalone}:/STM32WL # Path to compiler folder
      - /var/run/docker.sock:/var/run/docker.sock # Docker socket to start container inside a container
    environment:
      - GENERAL_SETUP_PATH=/LoRaWAN/App # General_Setup.h path in compiler folder
      - CONFIG_APPLICATION_PATH=/LoRaWAN # config_application.h path in compiler folder

  compiler:
    image: montagny/arm-compiler:1.0 # Image used for compilation
    deploy:
      replicas: 0
      
volumes:
  shared-vol:
    name: "shared-vol"
```
It is an **Express.js server** that let allow us to create an API for the compilation.\
The image of the webapp is automatically built on *docker-compose up* based on the repo files.\

We need to pass the Docker volume **shared-vol** to facilitate data exchange between containers. This volume will automatically be created thanks to the three last lines.
The STM32WL-standalone compiler is passed as a volume so we can copy its content for compilation.
The **Docker daemon socket** is also passed to manipulate containers within a container (more infos in Step 4).

We also have the *montagny/arm-compiler:1.0* image that we will use for compilation. We set it to *deploy replicas 0* since we don't want to start it at *docker-compose up*, we only want to pull it.

**Step 2:** Send compilation through application interface
When you click on the *Compile* button on the interface, it will send a **POST request** to the **/compile API route**, sending a JSON payload with all the necessary compilation parameters, and also the *Client socket ID* to allow logs communication in real time with the client.
```bash
POST /compile
Content-Type: application/json

{
    "clientId": "9LeRkByYjp8opfXQAAAB",
    "formData": {
        "ACTIVATION_MODE": "OTAA",
        "CLASS": "CLASS_A",
        "SPREADING_FACTOR": "7",
        "ADAPTIVE_DR": "false",
        "CONFIRMED": "false",
        "APP_PORT": "15",
        "SEND_BY_PUSH_BUTTON": "false",
        "FRAME_DELAY": 10000,
        "PAYLOAD_1234": "true",
        "ADMIN_SENSOR_ENABLED": "false",
        "PAYLOAD_TEMPERATURE": "false",
        "PAYLOAD_HUMIDITY": "false",
        "USMB_VALVE": "false",
        "ATIM_THAQ": "false",
        "WATTECO_TEMPO": "false",
        "TCT_EGREEN": "false",
        "LOW_POWER": "false",
        "CAYENNE_LPP_": "false",
        "devEUI_": "0xec, 0xdb, 0x86, 0xff, 0xfd, 0x70, 0xc0, 0x21",
        "appKey_": "89,21,B1,3A,37,1C,69,C7,81,1C,DD,D5,7D,CE,E3,3C",
        "appEUI_": "0x28, 0x67, 0x66, 0xcb, 0x86, 0xf6, 0xb6, 0x51",
        "devAddr_": "0xda3425c0",
        "nwkSKey_": "09,aa,08,30,30,46,bb,5a,bd,56,59,ae,b9,c8,1e,12",
        "appSKey_": "e2,27,f8,af,d1,1e,bc,14,ae,b3,23,c7,e7,00,74,c3",
        "ADMIN_GEN_APP_KEY": "c7,6b,98,bb,80,96,57,40,30,a0,74,5f,f6,20,c5,d2"
    }
}
```

**Step 3:** Setup files
First we generate an ID for the process, and then we initialize the folders for configuration and result into the *shared-vol* volume.
```
ID : Rt3Le

shared-vol/
├── configs/
│   ├── Rt3LE/
├── results/
│   ├── Rt3LE/
```
Second, we copy the content of the STM32WL volume content into *configs*, which contains all the necessary .c and .h files for the compilation.
We modify the *General_Setup.h* and *config_application.h* using *regex* based on the JSON keys and values.
```
shared-vol/
├── configs/
│   ├── Rt3LE/
│   │   ├── Core/
│   │   ├── LoRaWAN/
│   │   ├── Makefile
│   │   ├── ...
├── results/
│   ├── Rt3LE/
```

**Step 4:** Start compiler container
Once the files are set up, we can launch the container inside JavaScript using the **Dockerode library**.
To use Dockerode, we first need to initialize the Docker client by specifying the *host's Docker socket path*:
```js
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
```
**Why is this necessary?** Since the web app is running inside a Docker container, it doesn't have a Docker daemon of its own. To launch additional containers, we need to access the Docker daemon running on the host machine. By mounting the Docker socket (/var/run/docker.sock) as a volume, we allow the containerized application to communicate with the host’s Docker engine.

This means that new containers are not started within the container running the web app; instead, they run directly on the host machine, just like the web app container itself. This approach avoids the need to install a full Docker engine inside the container and keeps the architecture simpler and more efficient.

After that, we can launch the container with this function :
```js
const imageName = 'montagny/arm-compiler:1.0' // image of the compiler
const volName = 'shared-vol' // name of the volume used to store configs and results

async function startCompilerContainer(compileId, configPath, resultPath, fileName, clientId) {
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
```
It will :
- Start the image *montagny/arm-compiler:1.0* with the *shared-vol* volume into a container
- Execute the custom CMD that moves config files into the compiler, compile and then move the result
- Delete the container
- Return the status (0 if everything went well)

At the end of the execution, we will also remove all the compilation files from the *shared-vol* volume.
The results folder is entirely cleared every dat at 03:00, or at launch.
```
shared-vol/
├── configs/
├── results/
│   ├── Rt3LE/
│   │   ├── ecdb86fffde224af-OTAA-CLASS_A-SF7-Unconfirmed.bin
```

**Step 5:** Receive the file
At the end of the compilation, we send a message through the websocket to the client containing informations about the compilation :
```json
{
    "id": "e324p",
    "type": "single", //single or multiple
    "status": 0,
    "fileName": "ecdb86fffd70c021-OTAA-CLASS_A-SF7-Unconfirmed.bin"
}
```
Based on this message, we can **GET** the file as a **blob** through the **/download API Route** .
A blob is a sendable version of the data inside a file.
```js
export async function downloadFirmware(compileId, type, fileName) {
  try {
    const response = await fetch(`./download?id=${compileId}&type=${type}&filename=${fileName}`, {
      method: "GET"
  });

    if (response.ok) {
      const blob = await response.blob();
      const fileName = response.headers.get("X-File-Name");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      store.compiledFile = blob;
      store.compiledFileName = fileName;
      if(type === "single" && elements.usbAutoSend.checked) {
        showSnackBar(
          "Program device ?",
          (confirm) => {
            if (confirm) {
              sendToUSBDevice(
                store.compiledFileName,
                store.compiledFile,
                store.usbPathHandle
              );
            }
          },
          false
        );
      }
    } else {
      const errorText = await response.json();
      console.log(errorText);
    }
  } catch (error) {
    console.error("Error:", error);
    showSnackBar("An error occurred while downloading the firmware");
  }
}
```
The file can also automatically be sent to the connected device.

**Multi-compilation**\
For multi-compilation, the process in almost the same. We use the **/compile-multiple** API Route, sending a JSON array containing all the parameters with randomly generated keys. We launch containers one after the other, and then we can download a *.zip* with all the *bin* files, and a *tts-end-device.csv* file with all the keys of the firmwares.