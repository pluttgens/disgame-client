'use strict';

const request = require('request');
const async = require('async');

const Ctx = require('../../helpers/context');
const jsonfile = require('../../helpers/config').jsonfile;
const winston = require('../../helpers/config').winston;

const configPath = './config.json';

const config = jsonfile.readFileSync(configPath);

module.exports = function (handler) {
    handler.on('user:register', function (msgHelper) {
        request({
            url: config.apiUrl + '/users/',
            method: 'POST',
            body: {
                user: msgHelper.getAuthorID()
            },
            json: true
        }, function (err, message, body) {
            if (err) {
                return msgHelper.error(err);
            }

            if (body.error) {
                return msgHelper.reply(body.error);
            }

            msgHelper.reply('Welcome ' + msgHelper.getEvent().d.author.username + '!\n' +
                '----------------------------------------------------------------------------------', (err, response) => {
                    if (err) {
                        return winston.debug(err);
                    }

                    handler.emit('character:create', msgHelper);
                });

        });
    });


    handler.on('character:create', function (msgHelper) {

        const context = Ctx.get(msgHelper.getAuthorID());
        context.state = 'character:create';

        let character = {};



        async.series({
            init: (next) => {
                msgHelper.reply(msgHelper.getEvent().d.author.username + ', create your character!', (err, response) => {
                    if (err) {
                        return next(err);
                    }

                    next();
                });
            },
            name: (next) => {
                context.callback = (msgHelper) => {
                    let name = msgHelper.getEvent().d.content;

                    request({
                        url: config.apiUrl + '/characters/',
                        method: 'GET',
                        qs: {
                            name: name
                        },
                        json: true
                    }, function (err, message, body) {
                        if (err) {
                            return msgHelper.error(err);
                        }

                        if (!body.error) {
                            return msgHelper.reply('Name already taken');
                        }

                        character.name = name;

                        return msgHelper.reply('Name available.', (err, response) => {
                            if (err) {
                                return msgHelper.error(err);
                            }

                            return next(null, name);
                        });

                    });
                }
                msgHelper.reply('Enter character name :');
            },
            race: (next) => {
                request({
                    url: config.apiUrl + '/races/',
                    method: 'GET',
                    json: true
                }, function (err, message, body) {
                    if (err) {
                        return msgHelper.error(err);
                    }

                    if (body.error) {
                        return msgHelper.reply(body.error);
                    }

                    let races = {};

                    body.races.forEach((race, i) => {
                        races[i] = race.name;
                    });

                    context.callback = (msgHelper) => {
                        let race = msgHelper.getEvent().d.content;

                        if (isNaN(race)) {
                            return msgHelper.reply('Invalid choice.');
                        }

                        if (!races[race]) {
                            return msgHelper.reply('Invalid choice.');
                        }
                        
                        return msgHelper.reply('Race chosen', (err, response) => {
                            if (err) {
                                return winston.debug(err);
                            }

                            return next(null, races[Number(race)]);
                        });
                    }

                    msgHelper.reply('Choose one race :', (err, response) => {
                        if (err) {
                            return winston.debug(err);
                        }

                        msgHelper.reply(races, true);
                    });
                });
            },
            class: (next) => {
                request({
                    url: config.apiUrl + '/classes/',
                    method: 'GET',
                    json: true
                }, function (err, message, body) {
                    if (err) {
                        return msgHelper.error(err);
                    }

                    if (body.error) {
                        return msgHelper.reply(body.error);
                    }

                    let classes = {};

                    body.classes.forEach((clazz, i) => {
                        classes[i] = clazz.name;
                    });

                    context.callback = (msgHelper) => {
                        let clazz = msgHelper.getEvent().d.content;

                        if (isNaN(clazz)) {
                            return msgHelper.reply('Invalid choice.');
                        }

                        if (!classes[clazz]) {
                            return msgHelper.reply('Invalid choice.');
                        }

                        return msgHelper.reply('Class chosen', (err, response) => {
                            if (err) {
                                return winston.debug(err);
                            }

                            return next(null, classes[Number(clazz)]);
                        });
                    }

                    msgHelper.reply('Choose one class :', (err, response) => {
                        if (err) {
                            return winston.debug(err);
                        }

                        msgHelper.reply(classes, true);
                    });
                });
            },
            sex: (next) => {
                context.callback = (msgHelper) => {
                    let sex = msgHelper.getEvent().d.content;

                    if (isNaN(sex)) {
                        return msgHelper.reply('Invalid choice.');
                    }

                    if (sex !== '0' && sex !== '1') {
                        return msgHelper.reply('Invalid choice.');
                    }

                    return msgHelper.reply('Sex chosen', (err, response) => {
                        if (err) {
                            return winston.debug(err);
                        }

                        return next(null, sex);
                    });
                }
                
                msgHelper.reply('Choose your gender :', (err, response) => {
                        if (err) {
                            return winston.debug(err);
                        }

                        msgHelper.reply({
                            0: 'Male',
                            1: 'Female'
                        }, true);
                    });
            }
        }, (err, results) => {
            context.callback = null;

            if (err) {
                return winston.debug(err);
            }

            request({
                url: config.apiUrl + '/characters',
                method: 'POST',
                body: {
                    user: msgHelper.getAuthorID(),
                    name: results.name,
                    race: results.race,
                    class: results.class,
                    sex: results.sex
                },
                json: true
            }, function (err, message, body) {
                if (err) {
                    return msgHelper.error(err);
                }

                if (body.error) {
                    return msgHelper.reply(body.error);
                }

                return msgHelper.reply('Character successfully created! (putin ca marche niksamer)');
            });
        });
    });
}