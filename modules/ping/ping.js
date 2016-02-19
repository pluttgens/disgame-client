'use strict';

const winston = require('../../helpers/config').winston;

module.exports = function (handler) {

    handler
        .on('ping', function (msgHelper) {
            msgHelper.doIfAllowed({ channel: true }, function (err) {
                if (err) {
                    return winston.debug(err);
                }
                msgHelper.reply('pong');
            });
        })
        .on('pingping', function (msgHelper) {
            msgHelper.doIfAllowed({ channel: true }, function (err) {
                if (err) {
                    return winston.debug(err);
                }
                msgHelper.reply('pong');
                msgHelper.reply('pong');
            });
        });

};