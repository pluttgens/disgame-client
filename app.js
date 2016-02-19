'use strict';

const DiscordClient = require('./lib/index');

const winston = require('./helpers/config').winston;
const jsonfile = require('./helpers/config').jsonfile;

const configPath = './config.json';

var auth;

try {
    auth = require('./auth')
} catch (e) {
    auth = jsonfile.readFileSnc(configPath).auth;
}

if (!auth) {
    throw new Error('No authentication object found. Check config.json.')
}

const bot = new DiscordClient({
    autorun: true,
    email: auth.email,
    password: auth.password
});

bot.on('ready', function () {
    winston.info('Bot started');

    bot.setPresence({
        game: "Bassu Doroppu"
    });

    setTimeout(() => {
        bot.sendMessage({
            to: '141179913192341504',
            message: 'Check me out on github : https://github.com/GenjitsuGame/bot-mmo-client'
        });

        //bot.sendMessage({
        //    to: '150019318262792192',
        //    message: 'Check me out on github : https://github.com/GenjitsuGame/bot-mmo-client'
        //});
    }), 1000 * 60 * 30;
});

// main
require('./modules/main')(bot);