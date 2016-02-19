'use strict';

const winston = require('../../helpers/config').winston;
const jsonfile = require('../../helpers/config').jsonfile;

const allowedPath = './allowed.json';

module.exports = function (handler) {

    handler
        .on('server:allow',(msgHelper) => {
            msgHelper.doIfAllowed({ admin: true },(err) => {
                if (err) {
                    return console.log(err);
                }

                jsonfile.readFile(allowedPath, (err, allowed) => {
                    Object.keys(msgHelper.getServer().channels).forEach(channel => {
                        if (allowed.channels.indexOf(channel) < 0) {
                            allowed.channels.push(channel);
                        }
                    });

                    jsonfile.writeFile(allowedPath, allowed, (err) => {
                        if (err) {
                            return msgHelper.reply('Could not register the channels.');
                        }
                        return msgHelper.reply('Server channels registered.');
                    });
                });
            });
        })
        .on('server:unallow', (msgHelper) => {
            msgHelper.doIfAllowed({ admin: true }, (err) => {
                if (err) {
                    return winston.debug(err);
                }

                jsonfile.readFile(allowedPath,(err, allowed) => {
                    Object.keys(msgHelper.getServer().channels).forEach(channel => {
                        let channelIndex;
                        if ((channelIndex= allowed.channels.indexOf(channel)) >= 0) {
                            allowed.channels.splice(channelIndex, 1);
                        }
                    });

                    jsonfile.writeFile(allowedPath, allowed,(err) => {
                        if (err) {
                            return msgHelper.reply('Could not unregister the channels.');
                        }
                        return msgHelper.reply('Server channels unregistered.');
                    });
                });
            });
        })
        .on('server:invite', (msgHelper) => {
            msgHelper.doIfAllowed({channel: true}, (err) => {
                if (err) {
                    return winston.debug(err);
                }
                if (!msgHelper.params) {
                    return msgHelper.reply('No invite found');
                }

                let inviteIndex;
                if ((inviteIndex = msgHelper.param[0].lastIndexOf('/')) >= 0) {
                    msgHelper.param[0] = msgHelper.param[0].substr(inviteIndex);
                }


                handler.bot.acceptInvite(msgHelper.param[0], (err, response) => {
                    if (err) {
                        winston.debug(err);
                        return msgHelper.reply('Could not join the server');
                    }

                    msgHelper.reply('Successfully joined the server');
                    winston.debug(response);
                });
            });
        })
        .on('server:leave', (msgHelper) => {
            msgHelper.reply('NOT IMPLEMENTED YET.');
        });
};