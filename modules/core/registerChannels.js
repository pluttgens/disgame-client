'use strict';

const jsonfile = require('../../helpers/config').jsonfile;

const allowedPath = './allowed.json';

module.exports = function (handler) {

    handler
        .on('channel:allow', function (msgHelper) {
            msgHelper.doIfAllowed({ admin: true }, function (err) {
                if (err) {
                    return console.log(err);
                }

                jsonfile.readFile(allowedPath, function (err, allowed) {
                    allowed.channels.push(msgHelper.getChannelID());
                    jsonfile.writeFile(allowedPath, allowed, function (err) {
                        if (err) {
                            return msgHelper.reply('Could not register the channel.');
                        }
                        return msgHelper.reply('Channel registered.');
                    });
                });

            });
        })
        .on('channel:unallow', function (msgHelper) {
            msgHelper.doIfAllowed({ admin: true }, function (err) {
                if (err) {
                    return console.log(err);
                }

                jsonfile.readFile(allowedPath, function (err, allowed) {
                    var index = allowed.channels.indexOf(msgHelper.getChannelID());

                    if (index < 0) {
                        return msgHelper.reply('This channel is not registered.');
                    }

                    allowed.channels.splice(index, 1);

                    jsonfile.writeFile(allowedPath, allowed, function (err) {
                        if (err) {
                            return msgHelper.reply('Could not unregister the channel.');
                        }
                        return msgHelper.reply('Channel unregistered.');
                    });
                });
            });
        });
};