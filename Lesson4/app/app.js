/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var wpi = require('wiring-pi');
// Use AMQP client to communicate with IoT Hub
var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;

// GPIO pin of the LED
var CONFIG_PIN = 7;

wpi.setup('wpi');
wpi.pinMode(CONFIG_PIN, wpi.OUTPUT);

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

var stopReceivingMessage = false;
/**
 * Log errors to console when completing messages.
 * If stopReceivingMessage flag is set, close connection to IoT Hub.
 * @param {string}  err - complete message error
 */
function completeMessageCallback(err) {
  if (err) {
    console.log('[Device] Complete message error: ' + err.toString());
  }
  if (stopReceivingMessage) {
    client.close(closeConnectionCallback);
  }
}

/**
 * Log information to console when closing connection to IoT Hub.
 * @param {string}  err - close connection error
 */
function closeConnectionCallback(err) {
  if (err) {
    console.error('[Device] Close connection error: ' + err.message + '\n');
  } else {
    console.log('[Device] Connection closed\n');
  }
}

/**
 * Process commands in received message.
 * @param {object}  msg - received message
 */
function receiveMessageCallback(msg) {
  var msgBodyString = msg.getData().toString('utf-8');
  var msgBody = JSON.parse(msgBodyString);
  console.log('[Device] Received message: ' + msgBodyString + '\n');
  switch (msgBody.command) {
    case 'stop':
      stopReceivingMessage = true;
      break;
    case 'blink':
    default:
      blinkLED();
      break;
  }
  client.complete(msg, completeMessageCallback);
}

/**
 * Start listening for cloud-to-device messages after getting connected to IoT Hub.
 * @param {string}  err - connection error
 */
function connectCallback(err) {
  if (err) {
    console.log('[Device] Could not connect: ' + err + '\n');
  } else {
    console.log('[Device] Client connected\n');
    client.on('message', receiveMessageCallback);
  }
}

// Read device connection string from command line arguments
var iotDeviceConnectionString = process.argv[2];
// Construct IoT Hub device client and connect to IoT Hub.
var client = clientFromConnectionString(iotDeviceConnectionString);
client.open(connectCallback);
