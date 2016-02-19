'use strict';

const EventEmitter = require('events');
const util = require('util');

function CallbackHandler(bot) {
    EventEmitter.call(this);

    this.bot = bot;
    this.contexts = {};
}

util.inherits(CallbackHandler, EventEmitter);

module.exports = function (bot) {

    const callbackHandler = new CallbackHandler(bot);

    //helpers
    require('../helpers/context').construct(callbackHandler);

    // core
    require('./core/help')(callbackHandler);
    require('./core/channels')(callbackHandler);
    require('./core/server')(callbackHandler);
    require('./core/cancel')(callbackHandler);

    // ping
    require('./ping/ping')(callbackHandler);

    //game
    require('./game/game')(callbackHandler);

    const MsgHelper = require('../helpers/messages')(bot);

    bot.on('message', function (user, userID, channelID, message, rawEvent) {

        let msgHelper = new MsgHelper(rawEvent);

        //        let command = message.shift();
        // 
        //         if (msgHelper.isDirectMessage) {
        //             directMessageCallbacks[command].forEach(c => c.call(bot));
        //         }

        if (callbackHandler.contexts[userID] && callbackHandler.contexts[userID].callback) {
            return callbackHandler.contexts[userID].callback(msgHelper);
        }

        if (!msgHelper.command) {
            return;
        }

        callbackHandler.emit(msgHelper.command, msgHelper);
    });
};