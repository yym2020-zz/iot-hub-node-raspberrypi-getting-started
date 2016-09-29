/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var gulp = require('gulp');

function initTasks(gulp) {
  require('gulp-common')(gulp, 'raspberrypi-node', { appName: 'lesson-4' });

  gulp.task('send-cloud-to-device-messages', false, function () {
    var config = require("./config.json");
    var Message = require('azure-iot-common').Message;
    var client = require('azure-iothub').Client.fromConnectionString(config.iot_hub_connection_string);

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
    var message = new Message('blink');

    var sentMessageCount = 0;
    var MaxMessageNumber = 20;

    var sendMessage = function () {
      message.messageId = sentMessageCount.toString();
      client.send(targetDevice, message, function (err) {
        if (err) {
          console.error('[IoT Hub] Send message error: ' + err.message);
        } else {
          console.log('[IoT Hub] Message sent: Id: ' + sentMessageCount.toString());
        }
        sentMessageCount++;
        if (sentMessageCount < MaxMessageNumber) {
          setTimeout(sendMessage, 2000);
        } else if (sentMessageCount == MaxMessageNumber) {
          message = new Message('stop');
          setTimeout(sendMessage, 1000);
        } else {
          client.close(closeConnectionCallback);
        }
      });
    };

    var closeConnectionCallback = function (err) {
      if (err) console.error('[IoT Hub] Close connection error: ' + err.message);
    };

    client.open(function (err) {
      if (err) {
        console.error('[IoT Hub] Fail to connect: ' + err.message);
      } else {
        console.error('[IoT Hub] Client connected');
        sendMessage();
      }
    });
  });

  gulp.task('run', 'Runs deployed sample on the board', ['run-internal', 'send-cloud-to-device-messages']);
}

initTasks(gulp);
