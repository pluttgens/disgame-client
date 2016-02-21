'use strict';

const winston = require('winston');
const jsonfile = require('jsonfile');

const allowedPath = './allowed.json';

module.exports = function (handler) {

    handler
        .on('server:allow', allow)
        .on('server:unallow', unallow)
        .on('server:invite', invite)
        .on('server:leave', leave);

    function allow (msgHelper)  {
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
    }

    function unallow (msgHelper) {
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
    }

    function invite (msgHelper) {
        msgHelper.doIfAllowed({channel: true}, (err) => {
            if (err) {
                return winston.debug(err);
            }
            if (!msgHelper.params) {
                return msgHelper.reply('No invite found');
            }

            let inviteIndex;
            if ((inviteIndex = msgHelper.params[0].lastIndexOf('/')) >= 0) {
                msgHelper.params[0] = msgHelper.params[0].substr(inviteIndex + 1);
            }


            handler.bot.acceptInvite(msgHelper.params[0], (err, response) => {
                if (err) {
                    winston.info(err);
                    return msgHelper.reply('Could not join the server');
                }

                msgHelper.reply('Successfully joined the server');
            });
        });
    }

    function leave (msgHelper) {
        msgHelper.reply('NOT IMPLEMENTED YET.');
    }

    return {
        allow: allow,
        unallow: unallow,
        invite: invite,
        leave: leave
    };
};