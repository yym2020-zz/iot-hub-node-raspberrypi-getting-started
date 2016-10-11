/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var wpi = require('wiring-pi');

// GPIO pin of the LED
var CONFIG_PIN = 7;
// Blinking interval in msec
var INTERVAL = 2000;

wpi.setup('wpi');
wpi.pinMode(CONFIG_PIN, wpi.OUTPUT);

var blinkTimes = 0;
function blinkLED() {
  blinkTimes++;
  console.log("[Device] #" + blinkTimes + " Blink LED \n");

  wpi.digitalWrite(CONFIG_PIN, 1);
  setTimeout(function () {
    wpi.digitalWrite(CONFIG_PIN, 0);
  }, 100);
}

setInterval(blinkLED, INTERVAL);
