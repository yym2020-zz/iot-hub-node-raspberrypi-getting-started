/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var wpi = require('wiring-pi');
var config = require('./config.json');
var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;

// GPIO pin of the LED
var CONFIG_PIN = 7;

wpi.setup('wpi');
wpi.pinMode(CONFIG_PIN, wpi.OUTPUT);

function blinkLED() {
  wpi.digitalWrite(CONFIG_PIN, 1);
  setTimeout(function () {
    wpi.digitalWrite(CONFIG_PIN, 0);
  }, 100);
}

var stopReceivingMessage = false;
function completeMessageCallback(err) {
  if (err) {
    console.log('[Device] Complete message error: ' + err.toString());
  }
  if (stopReceivingMessage) {
    client.close(closeConnectionCallback);
  }
}

function closeConnectionCallback(err) {
  if (err) {
    console.error('[Device] Close connection error: ' + err.message + '\n');
    return;
  }
  console.log('[Device] Connection closed\n');
}

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

function connectCallback(err) {
  if (err) {
    console.log('[Device] Could not connect: ' + err + '\n');
  } else {
    console.log('[Device] Client connected\n');
    client.on('message', receiveMessageCallback);
  }
}

var client = clientFromConnectionString(config.iot_device_connection_string);
client.open(connectCallback);
