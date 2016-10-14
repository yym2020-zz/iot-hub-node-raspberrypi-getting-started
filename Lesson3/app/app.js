/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var wpi = require('wiring-pi');
var Message = require('azure-iot-device').Message;
// Use AMQP client to communicate with IoT Hub
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
// Total messages to be sent
var MAX_MESSAGE_COUNT = 20;
var sentMessageCount = 0;

wpi.setup('wpi');
wpi.pinMode(CONFIG_PIN, wpi.OUTPUT);

/**
 * Start sending messages after getting connected to IoT Hub.
 * If there is any error, log the error message to console.
 * @param {string}  err - connection error
 */
function connectCallback(err) {
  if (err) {
    console.log('[Device] Could not connect: ' + err);
  } else {
    console.log('[Device] Client connected\n');
    // Wait for 5 seconds so that host machine gets connected to IoT Hub for receiving message.
    setTimeout(sendMessage, 5000);
  }
}

/**
 * Blink LED.
 */
function blinkLED() {
  // Light up LED for 100 ms
  wpi.digitalWrite(CONFIG_PIN, 1);
  setTimeout(function () {
    wpi.digitalWrite(CONFIG_PIN, 0);
  }, 100);
}

/**
 * Construct device-to-cloud message and send it to IoT Hub.
 */
function sendMessage() {
  sentMessageCount++;
  var message = new Message(JSON.stringify({ deviceId: deviceId, messageId: sentMessageCount }));
  console.log("[Device] Sending message #" + sentMessageCount + ": " + message.getData());
  client.sendEvent(message, sendMessageCallback);
}

/**
 * Blink LED after message is sent out successfully, otherwise log the error message to console.
 * If sent message count is less than max message count allowed, schedule to send another message.
 * Else, exit process after several seconds.
 * @param {object}  err - sending message error
 */
function sendMessageCallback(err) {
  if (err) {
    console.log('[Device] Message error: ' + err.toString());
  } else {
    // Blink once after successfully sending one message.
    blinkLED();
  }

  if (sentMessageCount < MAX_MESSAGE_COUNT) {
    setTimeout(sendMessage, INTERVAL);
  } else {
    // Wait 5 more seconds to exit so that Azure function has the chance to process sent messages.
    setTimeout(function () {
      process.exit();
    }, 5000);
  }
}

// Construct IoT Hub device client and connect to IoT Hub.
var client = clientFromConnectionString(iot_device_connection_string);
client.open(connectCallback);
