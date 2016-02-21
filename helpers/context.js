'use strict';

const request = require('request');
const jsonfile = require('jsonfile');

const configPath = './config.json';

const config = jsonfile.readFileSync(configPath);

function Context (user) {
    this.discordId = user;
    this._game = null;
    this.state = null;
    this.callback = null;
}

Context.prototype.getGameAccount = function (callback) {
    if (!this._game) {
        return this.authenticate((err, user) => {
            if (err) {
                return callback(err);
            }

            this._game = {
                id: user._id,
                characters: user.characters
            };
            return callback(err, this._game);
        });
    }

    return callback(null, this._game);
};

Context.prototype.setCallback = function (callback) {
    this.callback = (msgHelper) => {

        if (msgHelper.command !== 'cancel') {
            return callback(null, msgHelper);
        }

        msgHelper.reply('Successfully cancelled : ' + this.state);
        return callback({cancel: true});
    }
};

Context.prototype.authenticate = function (callback) {
    request({
        url: config.apiUrl + '/users',
        method: 'GET',
        qs: {
            discordId: this.discordId
        },
        json: true
    }, (err, response, body) => {
        if (err) {
            if (callback) {
                return callback(err);
            }
            return null;
        }

        if (body.error) {
            if (callback) {
                return callback(body.error);
            }
            return null;
        }

        let user = body.users[0];

        if (callback) {
            return callback(null, user)
        }
    });
};

module.exports = Context;