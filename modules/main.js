'use strict';

const EventEmitter = require('events');
const util = require('util');

const MsgHelper = require('../helpers/messages');

function CallbackHandler() {
    EventEmitter.call(this);
    
    this.contexts = {};
}

util.inherits(CallbackHandler, EventEmitter);

const callbackHandler = new CallbackHandler();

//helpers
require('../helpers/context').construct(callbackHandler);

// core
require('./core/help')(callbackHandler);
require('./core/registerChannels')(callbackHandler);

// ping
require('./ping/ping')(callbackHandler);

//game
require('./game/users')(callbackHandler);

module.exports = function (bot) {

    bot.on('message', function (user, userID, channelID, message, rawEvent) {

        let msgHelper = new MsgHelper(bot, rawEvent);

        //        let command = message.shift();
        // 
        //         if (msgHelper.isDirectMessage) {
        //             directMessageCallbacks[command].forEach(c => c.call(bot));
        //         }
        
        if (callbackHandler.contexts[userID] && callbackHandler.contexts[userID].callback) {
            return callbackHandler.contexts[userID].callback(msgHelper);
        }
        
        if (!msgHelper.getCommand()) {
            return;
        }
        
        callbackHandler.emit(msgHelper.getCommand(), msgHelper);
    });
}