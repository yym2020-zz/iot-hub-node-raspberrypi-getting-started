/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var eslint = require('gulp-eslint');
var gulp = require('gulp');
var expandTilde = require('expand-tilde');
var fs = require('fs-extra');
var config = require('./config.json');

gulp.task('init', () => {
  var settingTemplate = {
    device_host_name_or_ip_address: '[device hostname or IP adress]',
    device_user_name: 'pi',
    iot_hub_connection_string: '[IoT hub connection string]',
    iot_device_connection_string: '[IoT device connection string]',
    azure_storage_connection_string: "[Azure storage connection string]",
    iot_hub_consumer_group_name: 'cg1'
  };

  var settingFileAbsolutePath = expandTilde(config.settingFilePath);
  fs.ensureFileSync(settingFileAbsolutePath);
  try {
    require(settingFileAbsolutePath);
    console.log('Setting file detected at: ' + settingFileAbsolutePath);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.log('Setting file (' + settingFileAbsolutePath + ') is either empty or containing invalid content.');
      console.log('Use default template to overwrite it.');
      fs.outputJsonSync(settingFileAbsolutePath, settingTemplate);
    } else {
      console.error('Unexpected error: ' + err);
    }
  }
});

gulp.task('lint', () => {
  return gulp.src([
    '**/*.js',
    '!**/node_modules/**',
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
