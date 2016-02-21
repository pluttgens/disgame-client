'use strict';

const request = require('request');
const async = require('async');
const winston = require('winston');
const jsonfile = require('jsonfile');

const configPath = './config.json';

const config = jsonfile.readFileSync(configPath);

module.exports = function (handler) {
    handler
        .on('user:register', function (msgHelper) {
            request({
                url: config.apiUrl + '/users/',
                method: 'POST',
                body: {
                    user: msgHelper.getAuthorID()
                },
                json: true
            }, function (err, message, body) {
                if (err) {
                    return msgHelper.error(err);
                }

                if (body.error) {
                    return msgHelper.reply(body.error);
                }

                handler.get(msgHelper.getAuthorID()).id = body.id;

                msgHelper.reply('Welcome ' + msgHelper.event.d.author.username + '!\n' +
                    '----------------------------------------------------------------------------------', (err, response) => {
                    if (err) {
                        return msgHelper.error(err);
                    }

                    handler.emit('character:create', msgHelper);
                });
            });
        })
};