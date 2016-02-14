'use strict';

const jsonfile = require('jsonfile');
const winston = require('winston');

const configPath = './config.json';
const allowedPath = './allowed.json';

const config = jsonfile.readFileSync(configPath);

const cmd = config.cmd;

module.exports = function (bot, messageEvent) {

    const self = this;

    const _messageEvent = messageEvent;
    let _command;
    let _params;

    (() => {
        if (_messageEvent.d.content.indexOf(cmd) !== 0) {
            return false;
        }

        let parsedMessage = _messageEvent.d.content.replace(cmd, '').split(' ');
        _command = parsedMessage.shift();
        _params = parsedMessage;
    })();

    this.getEvent = () => {
        return _messageEvent;
    }

    this.getCommand = () => {
        return _command;
    }

    this.getParams = () => {
        return _params;
    }

    this.getChannelID = () => {
        return _messageEvent.d.channel_id;
    }

    this.getAuthorID = () => {
        return _messageEvent.d.author.id;
    }

    this.reply = function (message, isObject, callback) {
        if (typeof isObject === 'boolean' && isObject) {
            let prettyMessage = '```\n';
            Object.keys(message).forEach(key => {
                prettyMessage += key + ' - ' + message[key] + '\n';
            });
            message = prettyMessage + '```';
        }
        
        if (typeof isObject === 'function' && !callback) {
            callback = isObject;
        }

        bot.sendMessage({
            to: _messageEvent.d.channel_id,
            message: message
        }, callback);
    }

    this.isAllowed = function (options) {
        jsonfile.readFile(allowedPath, function (err, allowed) {
            if (options.admin &&
                bot.servers[bot.serverFromChannel(self._channelID)].owner_id !== _messageEvent.d.author.id &&
                !(allowed.admins.find(a => a === _messageEvent.d.author.id))) {
                return false;
            }

            if (options.channel &&
                !(allowed.channels.find(c => c === _messageEvent.d.channel_id))) {
                return false;
            }

            return true;
        });
    }

    this.doIfAllowed = function (options, callback) {
        jsonfile.readFile(allowedPath, function (err, allowed) {
            if (options.admin &&
                bot.servers[bot.serverFromChannel(self._channelID)].owner_id !== _messageEvent.d.author.id &&
                !(allowed.admins.find(a => a === _messageEvent.d.author.id))) {
                return callback('User need to be an admin.')
            }

            if (options.channel &&
                !(allowed.channels.find(c => c === _messageEvent.d.channel_id))) {
                return callback('Not allowed in this channel.');
            }

            return callback();
        });
    }

    this.isDirectMessage = () => {
        return _messageEvent.d.id in bot.directMessages;
    }

    this.error = (err) => {
        if (config.env === 'DEBUG') {
            self.reply(err);
        } else {
            self.reply('Internal Server Error.');
        }
    }
}