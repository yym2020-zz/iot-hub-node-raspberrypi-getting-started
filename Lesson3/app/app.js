/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var wpi = require('wiring-pi');
var Message = require('azure-iot-device').Message;
var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;

function getDeviceId(connectionString) {
  var elements = connectionString.split(';');
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].startsWith('DeviceId=')) {
      return elements[i].slice(9);
    }
  }
}

// Read device connection string from command line arguments
var iot_device_connection_string = process.argv[2];
var deviceId = getDeviceId(iot_device_connection_string);

// GPIO pin of the LED
var CONFIG_PIN = 7;

var MAX_BLINK_TIMES = 20;
var totalBlinkTimes = 1;

wpi.setup('wpi');
wpi.pinMode(CONFIG_PIN, wpi.OUTPUT);

function connectCallback(err) {
  if (err) {
    console.log('[Device] Could not connect: ' + err);
  } else {
    console.log('[Device] Client connected\n');
    sendMessage();
  }
}

function blinkLED() {
  wpi.digitalWrite(CONFIG_PIN, 1);
  setTimeout(function () {
    wpi.digitalWrite(CONFIG_PIN, 0);
  }, 100);
}

function sendMessage() {
  var message = new Message(JSON.stringify({ deviceId: deviceId, messageId: totalBlinkTimes }));
  console.log("[Device] Sending message #" + totalBlinkTimes + ": " + message.getData());
  client.sendEvent(message, sendMessageCallback);
}

function sendMessageCallback(err) {
  if (err) {
    console.log('[Device] Message error: ' + err.toString());
    return;
  }

  // Blink once after successfully sending one message.
  blinkLED();

  if (totalBlinkTimes < MAX_BLINK_TIMES) {
    totalBlinkTimes++;
    setTimeout(sendMessage, 2000);
  }
  else {
    // Wait 5 more seconds to exit so that Azure function has the chance to process sent messages.
    setTimeout(function () {
      process.exit();
    }, 5000);
  }
}

var client = clientFromConnectionString(iot_device_connection_string);
client.open(connectCallback);
