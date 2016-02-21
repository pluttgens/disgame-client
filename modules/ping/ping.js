'use strict';

const winston = require('winston');

module.exports = function (handler) {

    handler
        .on('ping', ping)
        .on('pingping', pingping);


    function ping (msgHelper) {
        msgHelper.doIfAllowed({ channel: true }, function (err) {
            if (err) {
                return winston.info(err);
            }
            msgHelper.reply('pong');
        });
    }

    function pingping (msgHelper) {
        msgHelper.doIfAllowed({ channel: true }, function (err) {
            if (err) {
                return winston.info(err);
            }
            msgHelper.reply('pong');
            msgHelper.reply('pong');
        });
    }

    return {
        ping: ping,
        pingping: pingping
    };
};