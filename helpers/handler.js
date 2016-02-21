'use strict';

const EventEmitter = require('events');
const util = require('util');

const Context = require('./context');

function Handler(bot) {
    EventEmitter.call(this);

    this.bot = bot;
    this._contexts = {};
}

util.inherits(Handler, EventEmitter);

Handler.prototype.get = function (user) {
    let context = this._contexts[user];

    if (!context) {
        context = this._contexts[user] = new Context(user);
    }

    return context;
};

module.exports = Handler;