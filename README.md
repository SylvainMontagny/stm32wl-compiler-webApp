# STM32WL Compiler Web Application
**stm32wl-compiler-webApp** is a web tool that compiles firmware for **STM32WL-based LoRaWAN end devices**. The application consists of two Docker containers:
1. A **web application** for user interaction.
2. An **STM32WL ARM compiler** for firmware generation.

The web application communicates with the compiler via **Docker Engine's Rest API**, enabling firmware compilation with customizable LoRaWAN and application settings.

The compiled firmware is based on the STM32CubeIDE project available here: 🔗 [GitHub Repository: STM32WL](https://github.com/SylvainMontagny/STM32WL/STM32WL-standalone)

## 1. Key Features
### LoRaWAN Configuration
- Activation Modes (OTAA-ABP)
- Device Class: Supports Class A, B, or C.
- Adjustable Spreading Factor
- ADR (Adaptive Data Rate)
- Acknowledgment (ACK)
- FPort

### Credential Management
- Auto-generation of **DevEUI, AppEUI, and AppKey** for OTAA.
- Auto-generation of **NwkSKey, AppSKey and DevAddr** for ABP.

### Application Settings
- Transmission Modes: Periodic or event-based.
- Payload Configuration.
- End-Device simulation.


## 2. Getting Started

### 2.1. Setup
 Follow the step below to install it.

1. Ensure [Docker](https://www.docker.com/) is installed on your system.

2. Clone STM32WL firmware and the web application repository.

```shell
git clone https://github.com/SylvainMontagny/STM32WL.git
git clone https://github.com/SylvainMontagny/stm32wl-compiler-webApp
```

3. Application installation
```shell
cd stm32wl-compiler-webApp
sudo docker compose up -d --build
```
- It runs the web application container based on the image **stm32wl-compiler-webapp**.
- It pulls the ARM compiler docker image **montagny/arm-compiler**.

4. Open you web browser and reach the URL : http://YOUR_IP_ADDRESS:4050

### 2.2 Notes and limitations

**Default STM32WL firmware Path:**

1. The source firmware project path is preset to `../STM32WL/STM32WL-standalone` in the `docker-compose.yml` file. The project folder is mounted as a volume to the stm32wl-compiler-webapp container. If you want to specify an alternative path, rename the environment template file *.env.example*:

```bash
mv .env.example .env
```

Edit the .env file and define your custom path:
```makefile
STM32WL_PATH=/your/custom/path/here
```

2. The following functionalities are disabled when the web application is not served over HTTPS:

- **Copy/Paste** button functionality

- **Send to Device** feature



## 3. Backend documentation

### 3.1 Docker containers

1. **stm32-compiler-webapp**

It is an **Express.js server** that includes a front end (html/css/js) and a back end interface (Nodejs) that create the overall web application. **stm32-compiler-webapp** is based on the image **stm32-compiler-webapp** built on startup from the Dockerfile.

There are 3 volumes:
- **shared-vol** is used to facilitate data exchange between containers.
- **STM32WL_PATH** is used to provide the STM32WL-standalone firmware to the web application. It's this project that will be modified depending on the user configuration from the front end.
- **/var/run/docker.sock** is used to give the container the ability to interact with the host's Docker daemon.

2. **stm32wl-arm-compiler**
It is an ARM compiler based on the **montagny/arm-compiler** docker image. We set it to *deploy replicas 0* since we don't want to start it at *docker-compose up*, we only pull the image.

### 3.2 Compilation process
**Step 1.** When we click on the *Compile* button, the web application executes the **/compile** route (POST Request) with a JSON payload (called jsonConfig) corresponding to the configuration made from the user interface, there is also the *Client socket ID* to allow logs communication in real time with the client.

Here is an example of the JSON payload (jsonConfig):
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

**Step 2.** All parameters on the **jsonConfig** are checked :
- Keys must have the right lenght,
- Booleans must be booleans,
- Strings must be strings,
- Numbers must be numbers,

**Step 3.** The following files architecture is created in the shared volume:

```
shared-vol/
├── configs/
│   ├── Rt3LE/
├── results/
│   ├── Rt3LE/
```
*Rt3LE* is used as an example. It's a random ID generated for each compilation process.

**Step 4.** The STM32WL firmware is copied to the `config/Rt3LE` folder
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
5. *config_application.h* and *General_Setup.h* files are modified according to *jsonConfig*.
6. A new container based on the stm32wl-arm-compiler starts: 
- shared-vol is the volume to get the firwmare source to be compiled (shared/configs/Rt3LE).
- the correspondance between the folder ID (Rt3LE) and the container id saved to keep track when several compilation are processed.
7. We wait for the end of the compilation process, store the binary file in the `result` folder, then delete the containter and `config/Rt3LE`.
```
shared-vol/
├── configs/
├── results/
│   ├── Rt3LE/
│   │   ├── ecdb86fffde224af-OTAA-CLASS_A-SF7-Unconfirmed.bin
```
8. We download the binary file by sending a message through the websocket to the client with informations about the compilation :
```json
{
    "id": "e324p",
    "type": "single", //single or multiple
    "status": 0,
    "fileName": "ecdb86fffd70c021-OTAA-CLASS_A-SF7-Unconfirmed.bin"
}
```
Based on this message, we can **GET** the file as a **blob** through the **/download API Route** . A blob is a sendable version of the data inside a file.
The file can also automatically be sent to the connected device.

**Multi-compilation**\
For multi-compilation, the process in almost the same. We use the **/compile-multiple** API Route, sending a JSON array containing all the parameters with randomly generated keys. We launch containers one after another, and then we can download a *.zip* with all the *bin* files, and a *tts-end-device.csv* file with all the keys of the firmwares.