# LoRaWAN Compiler Webapp

**LoRaWAN Compiler Webapp** is a containerized web application that allows code compilation by launching containers via a POST Express API. It is designed to manage and isolate compilation environments securely and efficiently, making it easy to execute compilers on demand.

## Features

- Express.js API to launch compiler containers with Dockerode library
- Secure management of compilation environments
- Containerize web application via Docker

## Requirement

- [Docker](https://www.docker.com/)

## Installation and Setup

### Server Setup

To setup the webapp on a server, you will need a few steps

1. Pull pre-built images of the compiler and the webapp from the Docker Hub

```shell
docker pull eliasqzo/compiler-webapp:latest
docker pull eliasqzo/stm32wl:latest
```

2. Create shared-vol docker volume that containers will use to share files

```shell
docker volume create shared-vol
```

3. Run the webapp container

```shell
docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v shared-vol:/shared-vol -p 80:4050 eliasqzo/compiler-webapp:latest
```

You need to pass the docker.sock as a volume to let the webapp launch container with Dockerode library
You can replace the 80 port to bind on another port of your server, and you can also replace -it by -d to make it detached

### Build images

You can also build both images yourself if you made some modifications

```shell
docker build -t stm32wl STM32WL/
docker build -t compiler-webapp .
```

### Usage, Process overview and Libraries used

**Step 1:** Start the main web app container
```shell
docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v shared-vol:/shared-vol -p 80:4050 eliasqzo/compiler-webapp:latest
```
It is an **Express.js server** that let allow us to create an API for the compilation.
We need to pass the Docker volume **shared-vol** to facilitate data exchange between containers, and also the **Docker daemon socket** to manipulate containers within a container (more infos in Step 4)

**Step 2:** Send compilation through application interface
When you click on the *Compile* button on the interface, it will send a **POST request** to the **/compile API route**, sending a JSON payload with all the necessary compilation parameters
```bash
POST /compile
Content-Type: application/json

{
  "ACTIVATION_MODE": "OTAA",
  "CLASS": "CLASS_A",
  "SPREADING_FACTOR": "7",
  "ADAPTIVE_DR": "false",
  "CONFIRMED": "false",
  "APP_PORT": "15",
  "SEND_BY_PUSH_BUTTON": "false",
  "FRAME_DELAY": 10000,
  "PAYLOAD_HELLO": "true",
  "PAYLOAD_TEMPERATURE": "false",
  "PAYLOAD_HUMIDITY": "false",
  "LOW_POWER": "false",
  "CAYENNE_LPP_": "false",
  "devEUI_": "0x4d, 0xcb, 0x22, 0x06, 0x1b, 0xf6, 0xfe, 0x0f",
  "appKey_": "6D,0A,64,F9,0A,6F,F3,D0,46,0B,28,C5,F7,3D,B7,9B",
  "appEUI_": "0x3e, 0xb9, 0x38, 0x35, 0x84, 0xce, 0xe3, 0x07",
  "devAddr_": "0x0ad959fa",
  "nwkSKey_": "fc,8b,60,7a,6c,e0,13,1c,56,fd,ef,d4,3a,73,55,89",
  "appSKey_": "85,79,7f,05,06,e3,41,2e,e5,f0,a6,cb,c0,f7,86,92",
  "ADMIN_SENSOR_ENABLED": "false",
  "MLR003_SIMU": "false",
  "MLR003_APP_PORT": "30",
  "ADMIN_GEN_APP_KEY": "6f,92,b6,59,95,9f,9f,b5,50,0f,f1,3d,e7,eb,07,65"
}
```

**Step 3:** Setup files
First we generate an ID for the process, and the we initialize the folders for configuration and result into the *shared-vol*
```
ID : Rt3Le

shared-vol/
├── configs/
│   ├── Rt3LE/
├── results/
│   ├── Rt3LE/
```
We modify the *General_Setup.h* and *config_application.h* using *regex* based on the JSON keys and values. After that, we put them in the config folder
```
shared-vol/
├── configs/
│   ├── Rt3LE/
│   │   ├── General_Setup.h
│   │   ├── config_application.h
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

After that, we can launch the container with this function
```js
const imageName = 'eliasqzo/stm32wl:latest' // image of the compiler
const volName = 'shared-vol' // name of the volume used to store configs and results

async function startCompilerContainer(configPath, resultPath){
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
```
It will :
- Start the image *eliasqzo/stm32wl:latest* with the *shared-vol* volume into a container
- Execute the custom CMD that moves config files into the compiler, compile and then move the result
- Delete the container
- Return the status (0 if everything went well)

```
shared-vol/
├── configs/
│   ├── Rt3LE/
│   │   ├── General_Setup.h
│   │   ├── config_application.h
├── results/
│   ├── Rt3LE/
│   │   ├── STM32WL-standalone.bin
```

We can now send the status result and the file as a **blob** through the **/compile API Route**
A blob is a sendable version of the data inside a file.

**Step 5:** Receive the file
We can now receive the blob *client-side*, and store it into a file
This is the client function that send the request and get the file result
```js
async function compileFirmware(jsonString){
    try {
        // Send the request
        const response = await fetch('/compile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonString,
        });

        // Receive the blob and store it as a file
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'STM32WL-standalone.bin';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            const errorText = await response.text();
            alert('Error: ' + errorText);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while compiling the code');
    }
}
```

