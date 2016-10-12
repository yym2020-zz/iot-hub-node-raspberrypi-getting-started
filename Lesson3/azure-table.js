/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var moment = require('moment');
var storage = require('azure-storage');
var stopReadAzureTable = false;

var readAzureTable = function (config) {
  var tableService = storage.createTableService(config.azure_storage_connection_string);
  var condition = 'PartitionKey eq ? and RowKey gt ? ';
  var tableName = 'DeviceData';
  var timestamp = moment.utc().format('hhmmssSSS');

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
          console.log('[Azure Table] Read message: ' + result.entries[i].message['_'] + '\n');

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
}

var cleanup = function () {
  stopReadAzureTable = true;
}

module.exports.readAzureTable = readAzureTable;
module.exports.cleanup = cleanup;
