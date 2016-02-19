'use strict';

const request = require('request');
const async = require('async');

const Ctx = require('../../helpers/context');
const jsonfile = require('../../helpers/config').jsonfile;
const winston = require('../../helpers/config').winston;

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

                Ctx.get(msgHelper.getAuthorID()).id = body.id;

                msgHelper.reply('Welcome ' + msgHelper.event.d.author.username + '!\n' +
                    '----------------------------------------------------------------------------------', (err, response) => {
                    if (err) {
                        return winston.debug(err);
                    }

                    handler.emit('character:create', msgHelper);
                });
            });
        })
};