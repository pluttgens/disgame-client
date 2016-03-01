'use strict';

const winston = require('winston');
const jsonfile = require('jsonfile');
const disgame = require('disgame-api');
const configPath = './config.json';

const config = jsonfile.readFileSync(configPath);

module.exports = function (handler) {
    handler
        .on('user:register', userRegister);

    function userRegister (msgHelper) {
        return msgHelper
            .doIfAllowed({ channel : true })
            .then(() =>  {
                disgame
                    .registerUser(msgHelper.getAuthorID())
                    .then((response) => msgHelper.reply(response.error || 'Welcome ' + msgHelper.event.d.author.username + '!'))
                    .then((message) => {
                        handler.emit('character:create', msgHelper.getClean());
                        return message;
                    })
                    .catch(err => msgHelper.error(err));
            });
    }

    return {
        userRegister: userRegister
    };
};