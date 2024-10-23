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
