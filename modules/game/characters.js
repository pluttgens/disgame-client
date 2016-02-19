'use strict';

const request = require('request');
const async = require('async');

const Ctx = require('../../helpers/context');
const jsonfile = require('../../helpers/config').jsonfile;
const winston = require('../../helpers/config').winston;

const configPath = './config.json';

const config = jsonfile.readFileSync(configPath);

module.exports = function (handler) {
    handler
        .on('character:create', (msgHelper) => {

            const context = Ctx.get(msgHelper.getAuthorID());
            context.state = 'character:create';

            let character = {};

            async.series({
                user: (next) => {
                    context.getGameAccount((err, account) => {
                        if (err) {
                            return next(err);
                        }

                        console.log(account);
                        if(!account) {
                            return next(msgHelper.event.d.author.username + ' is not registered.\n' +
                                'Type "--user:register" to create an account and start playing');
                        }

                        msgHelper.reply(msgHelper.event.d.author.username + ', create your character!', (err, response) => {
                            if (err) {
                                return next(err);
                            }

                            next(null, account.id);
                        });
                    });
                },
                name: (next) => {
                    context.setCallback((err, msgHelper) => {
                        if (err) {
                            return next(err);
                        }

                        let name = msgHelper.event.d.content;

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
                    });
                    msgHelper.reply('Enter character name :');
                },
                race: (next) => {
                    request({
                        url: config.apiUrl + '/races/',
                        method: 'GET',
                        json: true
                    }, function (err, message, body) {
                        if (err) {
                            return winston.debug(err);
                        }

                        if (body.error) {
                            return msgHelper.reply(body.error);
                        }

                        let races = {};

                        body.races.forEach((race, i) => {
                            races[i] = race.name;
                        });

                        context.setCallback((err, msgHelper) => {
                            if (err) {
                                return next(err);
                            }

                            let race = msgHelper.event.d.content;

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

                                return next(null, body.races[Number(race)]._id);
                            });
                        });

                        msgHelper.reply('Choose one race :', (err, response) => {
                            if (err) {
                                return winston.debug(err);
                            }

                            msgHelper.reply(races);
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
                            return winston.debug(err);
                        }

                        if (body.error) {
                            return msgHelper.reply(body.error);
                        }

                        let classes = {};

                        body.classes.forEach((clazz, i) => {
                            classes[i] = clazz.name;
                        });

                        context.setCallback((err, msgHelper) => {
                            if (err) {
                                return next(err);
                            }

                            let clazz = msgHelper.event.d.content;

                            if (isNaN(clazz)) {
                                return msgHelper.reply('Invalid choice.');
                            }

                            if (!classes[clazz]) {
                                return msgHelper.reply('Invalid choice.');
                            }

                            return msgHelper.reply('Class chosen', (err, response) => {
                                if (err) {
                                    return next(err);
                                }

                                return next(null, body.classes[Number(clazz)]._id);
                            });
                        });

                        msgHelper.reply('Choose one class :', (err, response) => {
                            if (err) {
                                return next(err);
                            }

                           return msgHelper.reply(classes);
                        });
                    });
                },
                sex: (next) => {
                    context.setCallback((err, msgHelper) => {
                        if (err) {
                            return next(err);
                        }

                        let sex = msgHelper.event.d.content;

                        if (sex !== '0' && sex !== '1') {
                            return msgHelper.reply('Invalid choice.');
                        }

                        return msgHelper.reply('Sex chosen', (err, response) => {
                            if (err) {
                                return next(err);
                            }

                            return next(null, sex);
                        });
                    });

                    msgHelper.reply('Choose your gender :', (err, response) => {
                        if (err) {
                            return next(err);
                        }

                        msgHelper.reply({
                            0: 'Male',
                            1: 'Female'
                        });
                    });
                }
            }, (err, results) => {
                context.callback = null;

                if (err) {
                    if (err.cancel) {
                        return;
                    }
                    msgHelper.error(err);
                    return winston.debug(err);
                }

                request({
                    url: config.apiUrl +  '/users/' + results.user + '/characters',
                    method: 'POST',
                    body: {
                        name: results.name,
                        race: results.race,
                        class: results.class,
                        sex: results.sex ? 'f' : 'm'
                    },
                    json: true
                }, function (err, message, body) {
                    if (err) {
                        msgHelper.error(err);
                        return winston.debug(err);
                    }

                    if (body.error) {
                        return msgHelper.reply(body.error);
                    }

                    return msgHelper.reply('Character successfully created!');
                });
            });
        })
        .on('character:select', (msgHelper) => {
            const context = Ctx.get(msgHelper.getAuthorID());
            context.state = 'character:select';

            async.waterfall([
                (next) => {
                    context.getGameAccount((err, account) => {
                        if (err) {
                            return next(err);
                        }

                        return next(null, account.id)
                    });
                }, (user, next) => {
                    request({
                        url: config.apiUrl + '/users/' + user + '/characters',
                        method: 'GET',
                        json: true
                    }, (err, response, body) => {
                        if (err) {
                            return winston.debug(err);
                        }

                        if (body.error) {
                            return msgHelper.reply(body.error);
                        }

                        let characters = {};
                        body.characters.forEach((character, i) => {
                            characters[i] = 'Name  : ' + character.name + '\n';
                            characters[i] += '    Race  : ' + character.class.name + '\n';
                            characters[i] += '    Class : ' + character.race.name + '\n';
                            characters[i] += '    Sex   : ' + (character.sex ? 'Female' : 'Male') + '\n';
                            characters[i] += '    Level : ' + character.level + '\n';
                        });

                        context.setCallback((err, msgHelper) => {
                            if (err) {
                                return next(err);
                            }

                            let character = msgHelper.event.d.content;

                            if (!characters[character]) {
                                return msgHelper.reply('Invalid choice.');
                            }

                            return msgHelper.reply('Playing on : ' + body.characters[character].name, (err, response) => {
                                if (err) {
                                    return next(err);
                                }

                                return next(null, body.characters[character]);
                            });
                        });

                        msgHelper.reply('Select a character :', (err, response) => {
                            if (err) {
                                return next(err);
                            }

                            return msgHelper.reply(characters);
                        })
                    })
                }
            ], (err, character) => {
                context.callback = null;

                if (err) {
                    if (err.cancel) {
                        return;
                    }
                    msgHelper.error(err);
                    return winston.debug(err);
                }

                context.getGameAccount((err, account) => {
                    account.character = character;
                })
            });
        });
};