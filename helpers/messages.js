'use strict';

const winston = require('winston');
const jsonfile = require('jsonfile');
const util = require('util');
const Promise = require('bluebird');


const MessageBuffer = require('../utils/messageBuffer');

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
MessageHelper.prototype.reply = function (message) {
    if (Array.isArray(message)) {
        console.log('aa');
        return Promise.mapSeries(prettyPrintArr(message), message => {
            return this.buffer.write({
                channel: this.getChannelID(),
                user: this.getAuthorID(),
                content: message
            });
        });
    }
    if (typeof message === 'object') message = prettyPrintObj(message);
    return this.buffer.write({
        channel: this.getChannelID(),
        user: this.getAuthorID(),
        content: message
    });
    function prettyPrintObj(obj, before) {
        let prettyPrint = '';
        let keys = Object.keys(obj);
        let longest = keys.reduce((prev, curr) => curr.length > prev ? curr.length : prev, 0);
        keys.forEach((key, i) => {
            if (i) for (let j = 0 ; j < (before || -3) + 3 ; ++j) prettyPrint += ' ';
            prettyPrint += key;
            for (let j = key.length ; j < longest ; ++j) prettyPrint += ' ';
            prettyPrint += ' : ' + obj[key] + '\n';
        });
        return prettyPrint;
    }
    function prettyPrintArr(arr) {
        let prettyMessage = ['```\n'];
        let current = 0;
        let before = arr.length.toString().length;
        arr.forEach((e, i) => {
            if (typeof e === 'object') {
                e = prettyPrintObj(e, before);
            }
            if (prettyMessage[current].length + e.length > 1975) {
                prettyMessage[current] += '```';
                current = prettyMessage.push('```\n')
            }
            prettyMessage[current] += i;
            for (let j = i.toString().length ; j < before ; ++j) prettyMessage[current] += ' ';
            prettyMessage[current] += ' - ' + e + '\n';
        });
        prettyMessage[current] += '```';
        return prettyMessage;
    }
};
MessageHelper.prototype.doIfAllowed = function (options) {
    return new Promise((resolve, reject) => {
        if (this.isDirectMessage()) {
            return resolve();
        }

        resolve(Promise.promisify(jsonfile.readFile)(allowedPath)
            .then((allowed) => {
                if (options.admin &&
                    this.getServer().owner_id !== this.event.d.author.id &&
                    !(allowed.admins.find(a => a === this.event.d.author.id))) {
                    return Promise.reject({ status: 401, msg: 'User need to be an admin.' });
                }

                if (options.channel &&
                    !(allowed.channels.find(c => c === this.event.d.channel_id))) {
                    return Promise.reject({ status: 401, msg: 'Not allowed in this channel.' });
                }
            })
        );

    });
};
MessageHelper.prototype.isDirectMessage = function() {
    return this.event.d.channel_id in this.bot.directMessages;
};
MessageHelper.prototype.error = function (err) {
    if (typeof err === 'string') return this.reply(err);
    if (err.code === 'ECONNREFUSED') return this.reply('Could not connect to the server.');
    winston.info(err);
    return this.reply('Internal Server Error.');
};
MessageHelper.prototype.getClean = function () {
    let newEvent = JSON.parse(JSON.stringify(this.event));
    newEvent.content = '';
    return new MessageHelper(newEvent);
};
module.exports = function (bot) {
    MessageHelper.prototype.bot = bot;
    MessageHelper.prototype.buffer = new MessageBuffer(bot);
    return MessageHelper;
};