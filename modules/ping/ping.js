'use strict';

const winston = require('winston');

module.exports = function (handler) {

    handler
        .on('ping', function (msgHelper) {
            msgHelper.doIfAllowed({ channel: true }, function (err) {
                if (err) {
                    return winston.info(err);
                }
                msgHelper.reply('pong');
            });
        })
        .on('pingping', function (msgHelper) {
            msgHelper.doIfAllowed({ channel: true }, function (err) {
                if (err) {
                    return winston.info(err);
                }
                msgHelper.reply('pong');
                msgHelper.reply('pong');
            });
        });

};