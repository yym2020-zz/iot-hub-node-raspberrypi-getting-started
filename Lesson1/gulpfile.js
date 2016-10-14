/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

/**
 * Setup common gulp tasks: init, install-tools, deploy, run
 */
require('gulp-common')(require('gulp'), 'raspberrypi-node', {
  appName: 'lesson-1',
  config_template: {
    "device_host_name_or_ip_address": "[device hostname or IP adress]",
    "device_user_name": "pi",
    "device_password": "raspberry"
  },
  config_postfix: "raspberrypi"
});
