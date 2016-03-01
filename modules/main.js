'use strict';

const Handler = require('../helpers/handler');
require('bluebird').config({cancellation: true});

module.exports = function (bot) {

    const handler = new Handler(bot);

    //boot
    require('./boot/boot')(bot);

    // core
    require('./core/help')(handler);
    require('./core/channels')(handler);
    require('./core/server')(handler);
    require('./core/cancel')(handler);

    // ping
    require('./ping/ping')(handler);

    //game
    require('./game/game')(handler);

    const MsgHelper = require('../helpers/messages')(bot);

    bot.on('message', function (user, userID, channelID, message, rawEvent) {

        let msgHelper = new MsgHelper(rawEvent);

        if (handler.get(userID) && handler.get(userID).callback) {
            return handler.get(userID).callback(msgHelper);
        }

        if (!msgHelper.command) {
            return;
        }

        handler.emit(msgHelper.command, msgHelper);
    });
};