/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var gulp = require('gulp');

/**
 * Setup common gulp tasks: init, install-tools, deploy, run
 */
require('gulp-common')(gulp, 'raspberrypi-node', {
  appName: 'lesson-4',
  configTemplate: {
    "device_host_name_or_ip_address": "[device hostname or IP adress]",
    "device_user_name": "pi",
    "device_password": "raspberry",
    "iot_hub_connection_string": "[IoT hub connection string]",
    "iot_device_connection_string": "[IoT device connection string]"
  },
  configPostfix: 'raspberrypi'
});

/**
 * Gulp task to send cloud-to-device messages from host machine
 */
gulp.task('send-cloud-to-device-messages', false, function () {
  // Blink message interval in ms
  var INTERVAL = 2000;
  // Total messages to be sent
  var MAX_MESSAGE_COUNT = 20;
  var sentMessageCount = 0;

  var config = gulp.config;
  var Message = require('azure-iot-common').Message;
  // Construct IoT Hub client
  var client = require('azure-iothub').Client.fromConnectionString(config.iot_hub_connection_string);

  // Get device id from IoT device connection string
  var getDeviceId = function (connectionString) {
    var elements = connectionString.split(';');
    var dict = {};
    for (var i = 0; i < elements.length; i++) {
      var kvp = elements[i].split('=');
      dict[kvp[0]] = kvp[1];
    }
    return dict.DeviceId;
  };
  var targetDevice = getDeviceId(config.iot_device_connection_string);

  // Build cloud-to-device message with message Id
  var buildMessage = function (messageId) {
    if (messageId < MAX_MESSAGE_COUNT) {
      return new Message(JSON.stringify({ command: 'blink', messageId: messageId }));
    } else {
      return new Message(JSON.stringify({ command: 'stop', messageId: messageId }));
    }
  };

  // Construct and send cloud-to-device message to IoT Hub
  var sendMessage = function () {
    sentMessageCount++;
    var message = buildMessage(sentMessageCount);
    console.log('[IoT Hub] Sending message #' + sentMessageCount + ': ' + message.getData());
    client.send(targetDevice, message, sendMessageCallback);
  };

  // Start another run after message is sent out
  var sendMessageCallback = function (err) {
    if (err) {
      console.error('[IoT Hub] Sending message error: ' + err.message);
    }
    run();
  };

  var run = function () {
    if (sentMessageCount == MAX_MESSAGE_COUNT) {
      client.close(closeConnectionCallback);
    } else {
      setTimeout(sendMessage, INTERVAL);
    }
  };

  // Log information to console when closing connection to IoT Hub
  var closeConnectionCallback = function (err) {
    if (err) {
      console.error('[IoT Hub] Close connection error: ' + err.message + '\n');
    } else {
      console.log('[IoT Hub] Connection closed\n');
    }
  };

  // Start running this sample after getting connected to IoT Hub.
  // If there is any error, log the error message to console.
  var connectCallback = function (err) {
    if (err) {
      console.error('[IoT Hub] Fail to connect: ' + err.message + '\n');
    } else {
      console.log('[IoT Hub] Client connected\n');
      // Wait for 5 seconds so that device gets connected to IoT Hub.
      setTimeout(run, 5000);
    }
  };

  // Connect to IoT Hub
  client.open(connectCallback);
});

/**
 * Override 'run' task with customized behavior
 */
gulp.task('run', 'Runs deployed sample on the board', ['run-internal', 'send-cloud-to-device-messages']);

