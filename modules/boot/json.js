'use strict';

const winston = require('winston');
const jsonfile = require('jsonfile');

const configPath = './config.json';
const allowedPath = './allowed.json';

const config = jsonfile.readFileSync(configPath);
const allowed = jsonfile.readFileSync(allowedPath);

module.exports = function (bot) {

    (function editBotFromConfig () {
        let info = {};
        let botConfig = config.bot;
        let _botConfig = config._private._bot;
        if (!botConfig || botConfig === _botConfig) {
            return;
        }
        if (botConfig.avatar) {
            try {
                info.avatar = require('fs').readFileSync(botConfig.avatar, 'base64');
            } catch (e) { delete info.avatar; }
        }
        if (botConfig.username) {
            info.username = botConfig.username;
        }
        try {
            info.password = require('../../auth').password;
        } catch (e) {
            info.password = config.auth.password;
        }
        bot.editUserInfo(info, (err, response) => {
            if (err) {
                return winston.info(err);
            }

            config._private._bot = botConfig;
            return jsonfile.writeFile(configPath, config, (err) => {
                if (err) {
                    return winston.info(err);
                }
            });
        });

        if (!botConfig.game) {
            return;
        }

        bot.setPresence({
            game: botConfig.game
        });
    })();

    (function updateAllowed () {
        if (!allowed.channels) {
            return;
        }

        allowed.channels = allowed.channels.filter(channel => {
            if (!bot.servers) {return false;}
            return Object.keys(bot.servers).some(serverID => {
                if (!bot.servers[serverID].channels) {return false;}
                return Object.keys(bot.servers[serverID].channels).indexOf(channel) >= 0;
            });
        });

        let newAllowed = allowed;
        if (!newAllowed) {
            newAllowed = {};
        }

        jsonfile.writeFile(allowedPath, newAllowed, (err) => {
            if (err) {
                return winston.info(err);
            }
        });
    })();
};