/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var gulp = require('gulp');
var args = require('get-gulp-args')();

var doesReadStorage = args['read-storage'];
var receiveMessages = doesReadStorage ? require('./azure-table.js').readAzureTable : require('./iot-hub.js').readIoTHub;
var cleanup = doesReadStorage ? require('./azure-table.js').cleanup : require('./iot-hub.js').cleanup;

var expandTilde = require('expand-tilde');

function initConfig() {
  var settingFileAbsolutePath = expandTilde(require('../config.json').settingFilePath);
  try {
    var sharedSettings = require(settingFileAbsolutePath);
  } catch (err) {
    console.error('Fail to read settings from ' + settingFileAbsolutePath);
    console.error('You need to run `gulp init` in parent folder before running sample.');
    process.exit(1);
  }
  var config = require('./config.json');
  return Object.assign(sharedSettings, config);
}

function initTasks(gulp) {
  var runSequence = require('run-sequence').use(gulp);
  var config = initConfig();

  require('gulp-common')(gulp, 'raspberrypi-node', { appName: 'lesson-3', config: config });

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
