'use strict';

module.exports = function (bot) {

    const express = require('express');
    const router = express.Router();
    const jsonfile = require('jsonfile');
    const winston = require('winston');

    const messageBuffer = require('../../helpers/messageBuffer').get();

    router
        .post('/', (req, res) => {
            let event = req.headers['X-GitHub-Event'];
            winston.info('X-GitHub-Event', event);

            jsonfile.readFile(req.app.locals.config, (err, config) => {
                if (err) {
                    return winston.info(err);
                }

                if (!(event in config.github.events)) {
                    return;
                }

                if (event === config.github.events.ping) {
                    messageBuffer.write(config.bot.channels.dev, null, 'GitHub webservice successfully hooked!');
                }

                if (event === config.github.events.push) {
                    let message = '**' + req.body.repository.full_name + '** [' + req.body.pusher.name + ',<' + req.body.pusher.email + '>]';
                    req.body.commits.forEach(commit => {
                        message += '\n`' + commit.id + '` ' + commit.message + ' [' + commit.comitter.username + ',<' + commit.comitter.email + '>]';
                    });

                    if (message.length > 2000) {
                        message = message.substring(0, 1997) + '...';
                    }

                    messageBuffer.write(config.bot.channels.dev, null, message);
                }

                if (event === config.github.events.pullRequest) {

                }

            });
            return res.end();
        });

    return router;
};

