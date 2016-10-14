/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var gulp = require('gulp');
var args = require('get-gulp-args')();

var doesReadStorage = args['read-storage'];
var receiveMessages = doesReadStorage ? require('./azure-table.js').readAzureTable : require('./iot-hub.js').readIoTHub;
var cleanup = doesReadStorage ? require('./azure-table.js').cleanup : require('./iot-hub.js').cleanup;

function initTasks(gulp) {
  var runSequence = require('run-sequence').use(gulp);

  require('gulp-common')(gulp, 'raspberrypi-node', {
    appName: 'lesson-3',
    config_template: {
      "device_host_name_or_ip_address": "[device hostname or IP adress]",
      "device_user_name": "pi",
      "device_password": "raspberry",
      "iot_hub_connection_string": "[IoT hub connection string]",
      "iot_device_connection_string": "[IoT device connection string]",
      "azure_storage_connection_string": "[Azure storage connection string]",
      "iot_hub_consumer_group_name": "cg1"
    },
    config_postfix: 'raspberrypi' 
  });

  var config = gulp.config;
  gulp.task('cleanup', false, cleanup);

  gulp.task('send-device-to-cloud-messages', false, function () {
    runSequence('run-internal', 'cleanup');
  })

  if (doesReadStorage) {
    gulp.task('query-table-storage', false, () => { receiveMessages(config); });
    gulp.task('run', 'Runs deployed sample on the board', ['query-table-storage', 'send-device-to-cloud-messages']);
  } else {
    gulp.task('query-iot-hub-messages', false, () => { receiveMessages(config); });
    gulp.task('run', 'Runs deployed sample on the board', ['query-iot-hub-messages', 'send-device-to-cloud-messages']);
  }
}

initTasks(gulp);
