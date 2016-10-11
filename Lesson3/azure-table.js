/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var exec = require('child_process').exec;
var moment = require('moment');
var storage = require('azure-storage');
var config = require('./config.json');
var params = require('./arm-template-param.json').parameters;

var stopReadAzureTable = false;

var readAzureTable = function () {
  var command = 'az storage account show-connection-string -g ' + config.resource_group + ' -n ' + params.resoucePrefix.value + 'storage';
  exec(command, function (err, stdout, stderr) {
    if (err) {
      console.error('[Azure Table] ERROR:\n' + err);
      return;
    }
    if (stderr) {
      console.error('[Azure Table] Message from STDERR:\n' + stderr);
    }
    if (stdout) {
      var connStr = JSON.parse(stdout).connectionString;
      if (connStr) {
        var tableService = storage.createTableService(connStr);
        var condition = 'PartitionKey eq ? and RowKey gt ? ';
        var tableName = 'DeviceData';
        var timestamp = moment.utc().format('hhmmssSSS');

        var messageCount = 0;

        var readNewMessages = function () {
          var query = new storage.TableQuery().where(condition, moment.utc().format('YYYYMMDD'), timestamp);

          tableService.queryEntities(tableName, query, null, function (error, result) {
            if (error) {
              // Table not found.
              if (error.statusCode && error.statusCode == 404) {
                console.error(
                  '[Azure Table] ERROR: Table not found. Something might be wrong. Please go to troubleshooting page for more information.')
              } else {
                console.error('[Azure Table] ERROR:\n' + error);
              }
              setTimeout(readNewMessages, 0);
              return;
            }

            // result.entries contains entities matching the query
            if (result.entries.length > 0) {
              for (var i = 0; i < result.entries.length; i++) {
                ++messageCount;
                console.log('[Azure Table] Read message #' + messageCount + ': ' + result.entries[i].message['_'] + '\n');

                if (result.entries[i].RowKey['_'] > timestamp) {
                  timestamp = result.entries[i].RowKey['_'];
                }
              }
            }
            if (!stopReadAzureTable) {
              setTimeout(readNewMessages, 0);
            }
          });
        }

        readNewMessages();
      } else {
        console.error('[Azure Table] ERROR: Fail to get connection string of Azure Storage account.')
      }
    } else {
      console.error('[Azure Table] ERROR: No output when getting connection string of Azure Storage account.');
    }
  });
}

var cleanup = function () {
  stopReadAzureTable = true;
}

module.exports.readAzureTable = readAzureTable;
module.exports.cleanup = cleanup;
