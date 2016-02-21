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

    // main
    require('./modules/main')(bot);
});

