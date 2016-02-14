'use strict';

const DiscordClient = require('discord.io');


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

    // bot.sendMessage({
    //     to: '139377723574452225',
    //      message: 'Please give bot back!! :('
    //  });

});

require('./modules/main')(bot);

// app.server = http.createServer(app);
// 
// app.listen(2101);