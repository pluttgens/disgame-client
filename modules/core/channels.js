'use strict';

const winston = require('winston');
const jsonfile = require('jsonfile');
const Promise = require('bluebird');
const readFile = Promise.promisify(jsonfile.readFile);
const writeFile = Promise.promisify(jsonfile.writeFile);
const allowedPath = './allowed.json';

module.exports = function (handler) {

    handler
        .on('channel:allow', allow)
        .on('channel:unallow',unallow);

    function allow (msgHelper) {
        msgHelper
            .doIfAllowed({ admin: true })
            .then(() => msgHelper.params.length > 0 ? msgHelper.params : [msgHelper.getChannelID()])
            .filter(channel => Object.keys(handler.bot.servers).some(server => channel in handler.bot.servers[server].channels))
            .map(channel => _allow(channel).reflect())
            .reduce((accumulator, inspection) => {
                if (inspection.isFulfilled()) accumulator.fulfilled.push(inspection.value());
                else accumulator.rejected.push(inspection.reason());
                return accumulator;
            }, { fulfilled: [], rejected: [] })
            .then(accumulator => {
                if (accumulator.fulfilled.length > 0) return msgHelper.reply('Successfully registered channels : ' + accumulator.fulfilled.join(', ')).then(() => accumulator);
                return accumulator;
            })
            .then(accumulator => {
                if (accumulator.rejected.length > 0) return msgHelper.reply('Could not register channels : ' + accumulator.rejected.join(', '));
            });
    }

    function _allow (channel) {
        return readFile(allowedPath)
            .then(allowed => {
                if (!allowed.channels) {
                    allowed.channels = [channel];
                    return allowed;
                }
                if (allowed.channels.indexOf(channel) > -1) return Promise.reject('Already registered');
                allowed.channels.push(channel);
                return allowed;
            })
            .then(allowed => writeFile(allowedPath, allowed))
            .then(() => channel)
            .catch((err) =>  Promise.reject(channel + ' (' + err + ')'))
    }

    function unallow (msgHelper) {
        msgHelper.doIfAllowed({ admin: true }, function (err) {
            if (err) {
                return winston.debug(err);
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
    }

    return {
        allow: allow,
        unallow: unallow
    };
};