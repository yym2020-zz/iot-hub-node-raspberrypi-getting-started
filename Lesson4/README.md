---
services: iot-hub, iot-suite
platforms: nodejs
author: xscript
---

# Send device-to-cloud messages
This sample repo accompanies [Lesson 4: Send cloud-to-device messages](https://azure.microsoft.com/en-us/documentation/articles/iot-hub-raspberry-pi-kit-node-lesson4-send-cloud-to-device-messages/) lesson. It shows how to send messages from an Azure IoT hub to a Raspberry Pi 3
device.

## Prerequisites
See [Lesson 4: Send cloud-to-device messages](https://azure.microsoft.com/en-us/documentation/articles/iot-hub-raspberry-pi-kit-node-lesson4-send-cloud-to-device-messages/) for more information.

## Repository information
- `app` sub-folder contains the sample Node.js application that receives cloud-2-device messages.

## Running this sample
Please follow the [Lesson 4: Send cloud-to-device messages](https://azure.microsoft.com/en-us/documentation/articles/iot-hub-raspberry-pi-kit-node-lesson4-send-cloud-to-device-messages/) for detailed walkthough of the steps below.

### Deploy and run

Install required npm packages on the host:
```bash
npm install
```
Create a JSON configuration file in the `.iot-hub-getting-started` sub-folder of the current user's home directory:
```bash
gulp init
```

Install required tools/packages on the Raspberry Pi 3 device, deploy sample application, and run it on the device:
```bash
gulp
```