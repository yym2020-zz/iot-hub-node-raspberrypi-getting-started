/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var wpi = require('wiring-pi');
var Message = require('azure-iot-device').Message;
var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;

// Get device id from IoT device connection string
function getDeviceId(connectionString) {
  var elements = connectionString.split(';');
  var dict = {};
  for (var i = 0; i < elements.length; i++) {
    var kvp = elements[i].split('=');
    dict[kvp[0]] = kvp[1];
  }
  return dict.DeviceId;
}

// Read device connection string from command line arguments
var iot_device_connection_string = process.argv[2];
var deviceId = getDeviceId(iot_device_connection_string);

// GPIO pin of the LED
var CONFIG_PIN = 7;
// Blink interval in ms
var INTERVAL = 2000;
// Total blink times
var MAX_BLINK_TIMES = 20;
var sentMessageCount = 0;

wpi.setup('wpi');
wpi.pinMode(CONFIG_PIN, wpi.OUTPUT);

function connectCallback(err) {
  if (err) {
    console.log('[Device] Could not connect: ' + err);
  } else {
    console.log('[Device] Client connected\n');
    // Wait for 5 seconds so that host machine gets connected to IoT Hub for receiving message.
    setTimeout(sendMessage, 5000);
  }
}

function blinkLED() {
  // Light up LED for 100 ms
  wpi.digitalWrite(CONFIG_PIN, 1);
  setTimeout(function () {
    wpi.digitalWrite(CONFIG_PIN, 0);
  }, 100);
}

function sendMessage() {
  sentMessageCount++;
  var message = new Message(JSON.stringify({ deviceId: deviceId, messageId: sentMessageCount }));
  console.log("[Device] Sending message #" + sentMessageCount + ": " + message.getData());
  client.sendEvent(message, sendMessageCallback);
}

function sendMessageCallback(err) {
  if (err) {
    console.log('[Device] Message error: ' + err.toString());
    return;
  }

  // Blink once after successfully sending one message.
  blinkLED();

  if (sentMessageCount < MAX_BLINK_TIMES) {
    setTimeout(sendMessage, INTERVAL);
  } else {
    // Wait 5 more seconds to exit so that Azure function has the chance to process sent messages.
    setTimeout(function () {
      process.exit();
    }, 5000);
  }
}

var client = clientFromConnectionString(iot_device_connection_string);
client.open(connectCallback);
