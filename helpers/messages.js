'use strict';

const jsonfile = require('jsonfile');
const util = require('util');

const MessageBuffer = require('./messageBuffer');

const configPath = './config.json';
const allowedPath = './allowed.json';

const config = jsonfile.readFileSync(configPath);

const cmd = config.cmd;


function MessageHelper (event) {

    this.event = event;
    this.command = null;
    this.params = null;

    if (this.event.d.content.indexOf(cmd) === 0) {
        let parsedMessage = this.event.d.content.replace(cmd, '').split(' ');
        this.command = parsedMessage.shift();
        this.params = parsedMessage;
    }
}
MessageHelper.prototype.getChannelID = function () {
    return this.event.d.channel_id;
};

MessageHelper.prototype.getAuthorID = function () {
    return this.event.d.author.id;
};

MessageHelper.prototype.getServer = function () {
    return this.bot.servers[this.bot.serverFromChannel(this.getChannelID())];
};

MessageHelper.prototype.reply = function (message, callback) {
    if (typeof message === 'object') {
        let prettyMessage = '```\n';
        Object.keys(message).forEach(key => {
            prettyMessage += key + ' - ' + message[key] + '\n';
        });
        message = prettyMessage + '```';
    }


    this.buffer.write(this.getChannelID(), this.getAuthorID(), message, callback);
};


MessageHelper.prototype.isAllowed = function (options) {
    jsonfile.readFile(allowedPath, (err, allowed) => {
        return (this.isDirectMessage() ||
        (!(options.admin &&
        this.getServerID.owner_id !== this.event.d.author.id &&
        !(allowed.admins.find(a => a === this.event.d.author.id))) &&
        !(options.channel &&
        !(allowed.channels.find(c => c === this.event.d.channel_id)))));
    });
};

MessageHelper.prototype.doIfAllowed = function (options, callback)  {
    if (this.isDirectMessage()) {
        return callback();
    }

    jsonfile.readFile(allowedPath, (err, allowed) => {
        if (options.admin &&
            this.getServer().owner_id !== this.event.d.author.id &&
            !(allowed.admins.find(a => a === this.event.d.author.id))) {
            return callback('User need to be an admin.')
        }

        if (options.channel &&
            !(allowed.channels.find(c => c === this.event.d.channel_id))) {
            return callback('Not allowed in this channel.');
        }

        return callback();
    });
};

MessageHelper.prototype.isDirectMessage = function() {
    return this.event.d.channel_id in this.bot.directMessages;
};

MessageHelper.prototype.error = function (err) {
    if (err.code === 'ECONNREFUSED') {
        return this.reply('Could not connect to the server.');
    }
    this.reply('Internal Server Error.');
};

module.exports = function (bot) {
    MessageHelper.prototype.bot = bot;
    MessageHelper.prototype.buffer = new MessageBuffer(bot);
    return MessageHelper;
};