/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var gulp = require('gulp');

function initTasks(gulp) {

  // Blink interval in ms
  var INTERVAL = 2000;
  // Total blink times
  var MAX_BLINK_TIMES = 20;
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
    var commandMessage = {
      command: 'blink'
    };

    // Send new message once previous message is sent out
    var sendMessageCallback = function (err) {
      if (err) {
        console.error('[IoT Hub] Sending message error: ' + err.message);
      }
      if (sentMessageCount < MAX_BLINK_TIMES) {
        setTimeout(sendMessage, INTERVAL);
      } else if (sentMessageCount == MAX_BLINK_TIMES) {
        // Use the last message to instruct the device app to stop receiving messages
        commandMessage.command = 'stop';
        setTimeout(sendMessage, INTERVAL);
      } else {
        client.close(closeConnectionCallback);
      }
    };

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
    var sendMessage = function () {
      sentMessageCount++;
      commandMessage.messageId = sentMessageCount;
      var message = new Message(JSON.stringify(commandMessage));
      console.log('[IoT Hub] Sending message #' + sentMessageCount + ': ' + message.getData());
      client.send(targetDevice, message, sendMessageCallback);
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
        // Wait for 5 seconds so that Device gets connected to IoT Hub.
        setTimeout(sendMessage, 5000);
      }
    };

    client.open(connectCallback);
  });

  gulp.task('run', 'Runs deployed sample on the board', ['run-internal', 'send-cloud-to-device-messages']);
}

initTasks(gulp);
