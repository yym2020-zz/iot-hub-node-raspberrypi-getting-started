---
services: iot-hub, iot-suite
platforms: nodejs
author: ZhijunZhao
---

# Send device-to-cloud messages
This sample accompanies [Get started with your Raspberry Pi 3](https://aka.ms/rpi-node) tutorials. It shows how to send messages from a Raspberry Pi 3
device to Azure IoT hub. It also demonstrates how to use an Azure function app to receive incoming IoT hub messages and persist them
to Azure table storage.

## Prerequisites
See [step-by-step instructions](https://aka.ms/rpi-node-3) for more information.

## Repository information
- `app` sub-folder contains the sample Node.js application that sends device-2-cloud messages.
- `arm-template.json` is the ARM template containing an Azure function app and a storage account.
- `arm-template-param.json` file is the configuration file used by the ARM template.
- `config.json` is the configuration file that contains information required to connect to the board and your IoT hub.
- `ReceiveDeviceMessages` sub-folder contains Node.js code for the Azure function.

## Running this sample
Please follow the [step-by-step instructions](https://aka.ms/rpi-node-3) for detailed walkthough of the steps below.

### Deploy and run

```bash
npm install
```

```bash
gulp install-tools
gulp deploy
gulp run
```

```bash
gulp run --read-storage
```
