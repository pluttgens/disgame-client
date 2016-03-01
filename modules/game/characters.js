'use strict';

const winston = require('winston');
const jsonfile = require('jsonfile');
const disgame = require('disgame-api');
const Promise = require('bluebird');

const configPath = './config.json';

const config = jsonfile.readFileSync(configPath);

module.exports = function (handler) {
    handler
        .on('character:create', characterCreate)
        .on('character:select', characterSelect);

    function characterCreate(msgHelper) {
        const ctx = handler.get(msgHelper.getAuthorID());
        ctx.state = 'character:create';
        Promise
            .resolve(msgHelper.params)
            .then(params => {
                if (params.length > 0) return params;
                return msgHelper
                    .reply('Create your character!')
                    .then(() => {
                        return Promise.mapSeries([
                            characterCreateName,
                            characterCreateRace,
                            characterCreateClass,
                            characterCreateSex
                        ], promise => promise.call(ctx, msgHelper))
                    })
            })
            .spread((name, race, clazz, sex) => {
                disgame
                    .createCharacter(msgHelper.getAuthorID(), {
                        name: name,
                        race: race,
                        class: clazz,
                        sex: sex
                    })
                    .then(() => msgHelper.reply('Character successfully created.'))
                    .then(() => handler.emit('character:select', msgHelper.getClean()))
                    .catch(err => msgHelper.reply(err));
            });
    }

    function characterCreateName(msgHelper) {
        const defer = this.setCallback((msgHelper, resolve) => {
            let name = msgHelper.event.d.content;
            disgame.getCharacters({name: name})
                .then(characters => {
                    if (characters.length > 0) return msgHelper.reply('Name already taken');
                    return msgHelper.reply('Name available').then(() => resolve(name));
                });
        });
        msgHelper.reply('Enter character name :');
        return defer;
    }
    function characterCreateRace(msgHelper) {
        return disgame.getRaces()
            .map(race => race.name)
            .then(races => {
                const defer = this.setCallback((msgHelper, resolve) => {
                    let race = msgHelper.event.d.content;
                    if (!races[race]) return msgHelper.reply('Invalid choice.');
                    resolve(races[race]);
                });
                msgHelper.reply('Choose a race :')
                    .then(() => msgHelper.reply(races));
                return defer;
            });
    }
    function characterCreateClass(msgHelper) {
        return disgame.getClasses()
            .map(clazz => clazz.name)
            .then(classes => {
                const defer = this.setCallback((msgHelper, resolve) => {
                    let clazz = msgHelper.event.d.content;
                    if (!classes[clazz]) return msgHelper.reply('Invalid choice.');
                    resolve(classes[clazz]);
                });
                msgHelper.reply('Choose a class :')
                    .then(() => msgHelper.reply(classes));
                return defer;
            });
    }
    function characterCreateSex(msgHelper) {
        return Promise.resolve(['Male', 'Female'])
            .then(sexes => {
                const defer = this.setCallback((msgHelper, resolve) => {
                    let sex = msgHelper.event.d.content;
                    if (!sexes[sex]) return msgHelper.reply('Invalid choice.');
                    resolve(sexes[sex].charAt(0));
                });
                msgHelper
                    .reply('Choose your sex :')
                    .then(() => msgHelper.reply(sexes));
                return defer;
            });
    }
    function characterSelect(msgHelper) {
        const ctx = handler.get(msgHelper.getAuthorID());
        ctx.state = 'character:select';
        return disgame
            .getUserCharacters(msgHelper.getAuthorID())
            .then(characters => {
                return Promise
                    .map(characters, (character => {
                        return {
                            Name: character.name,
                            Race: character.race.name,
                            Class: character.class.name,
                            Sex: character.sex === 'M' ? 'Male' : 'Female',
                            Level: character.level
                        };
                    }))
                    .then(mappedCharacters => {
                        const defer = ctx.setCallback((msgHelper, resolve) => {
                            let character = msgHelper.event.d.content;
                            if(!characters[character]) return msgHelper.reply('Invalid choice.');
                            resolve(characters[character]);
                        });
                        msgHelper
                            .reply('Choose your character.')
                            .then(() => {
                                return msgHelper.reply(mappedCharacters);
                            });
                        return defer;
                    })
            })
            .then(character => {
                return ctx.getGameAccount()
                    .then(gameAccount => gameAccount.current = character)
                    .catch(() => {
                        ctx._game = { current: character };
                        return character;
                    });
            })
            .then(character => msgHelper.reply('Playing on : ' + character.name +'.'));
    }

    return {
        create: {
            create: characterCreate,
            name: characterCreateName,
            race: characterCreateRace,
            class: characterCreateClass,
            sex: characterCreateSex
        },
        select: characterSelect
    }
};