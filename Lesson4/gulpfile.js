/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var gulp = require('gulp');

function initTasks(gulp) {

  // Blink interval in ms
  var INTERVAL = 2000;
  // Total messages to be sent
  var MAX_MESSAGE_COUNT = 20;
  var sentMessageCount = 0;

  require('gulp-common')(gulp, 'raspberrypi-node', {
    appName: 'lesson-4',
    config_template: {
      "device_host_name_or_ip_address": "[device hostname or IP adress]",
      "device_user_name": "pi",
      "device_password": "raspberry",
      "iot_hub_connection_string": "[IoT hub connection string]",
      "iot_device_connection_string": "[IoT device connection string]"
    },
    config_postfix: 'raspberrypi'
  });

  var config = gulp.config;

  gulp.task('send-cloud-to-device-messages', false, function () {
    var Message = require('azure-iot-common').Message;
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

    var buildMessage = function (messageId) {
      if (messageId < MAX_MESSAGE_COUNT) {
        return new Message(JSON.stringify({ command: 'blink', messageId: messageId }));
      } else {
        return new Message(JSON.stringify({ command: 'stop', messageId: messageId }));
      }
    };

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

    var closeConnectionCallback = function (err) {
      if (err) {
        console.error('[IoT Hub] Close connection error: ' + err.message + '\n');
      } else {
        console.error('[IoT Hub] Connection closed\n');
      }
    };

    var connectCallback = function (err) {
      if (err) {
        console.error('[IoT Hub] Fail to connect: ' + err.message + '\n');
      } else {
        console.log('[IoT Hub] Client connected\n');
        // Wait for 5 seconds so that device gets connected to IoT Hub.
        setTimeout(run, 5000);
      }
    };

    client.open(connectCallback);
  });

  gulp.task('run', 'Runs deployed sample on the board', ['run-internal', 'send-cloud-to-device-messages']);
}

initTasks(gulp);
