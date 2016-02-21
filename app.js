'use strict';

const DiscordClient = require('./lib/index');

require('./helpers/config')();
const winston = require('winston');
const jsonfile = require('jsonfile');

const configPath = './config.json';

var auth;

try {
    auth = require('./auth')
} catch (e) {
    let configAuth = jsonfile.readFileSync(configPath, config).auth;
    auth = {
        email: process.env.BOT_EMAIL || configAuth.email,
        password: process.env.BOT_PASSWORD || configAuth.password
    }
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

    // main
    require('./modules/main')(bot);
});

