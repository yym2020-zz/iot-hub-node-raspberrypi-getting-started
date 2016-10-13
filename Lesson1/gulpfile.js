/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

// Consolidate config values from both config.json and the config file under user home folder
function initConfig() {
  var settingFileAbsolutePath = require('expand-tilde')(require('../config.json').settingFilePath);
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

// Setup gulp tasks for running this sample
require('gulp-common')(require('gulp'), 'raspberrypi-node', { appName: 'lesson-1', config: initConfig() });
