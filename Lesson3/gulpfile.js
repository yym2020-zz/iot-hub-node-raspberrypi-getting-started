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

  require('gulp-common')(gulp, 'raspberrypi-node', { appName: 'lesson-3' });

  gulp.task('cleanup', false, cleanup);

  gulp.task('send-device-to-cloud-messages', false, function () {
    runSequence('run-internal', 'cleanup');
  })

  if (doesReadStorage) {
    gulp.task('query-table-storage', false, receiveMessages);
    gulp.task('run', 'Runs deployed sample on the board', ['query-table-storage', 'send-device-to-cloud-messages']);
  } else {
    gulp.task('query-iot-hub-messages', false, receiveMessages);
    gulp.task('run', 'Runs deployed sample on the board', ['query-iot-hub-messages', 'send-device-to-cloud-messages']);
  }
}

initTasks(gulp);
