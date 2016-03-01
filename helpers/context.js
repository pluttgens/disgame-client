'use strict';

const jsonfile = require('jsonfile');
const disgame = require('disgame-api');
const Promise = require('bluebird');

const configPath = './config.json';

const config = jsonfile.readFileSync(configPath);

function Context (user) {
    this.discordId = user;
    this._game = null;
    this.state = null;
    this.callback = null;
}

Context.prototype.getGameAccount = function (force) {
    if (force || !this._game) {
        return this.authenticate()
            .then(user => {
                this._game = {user: user};
                return this._game;
            });
    }
    return Promise.resolve(this._game);
};

Context.prototype.setCallback = function (callback) {
    return new Promise((resolve, reject) => {
        this.callback = (msgHelper) => {
            if (msgHelper.command !== 'cancel') {
                return callback(msgHelper, value => {
                    this.callback = null;
                    resolve(value);
                }, reject);
            }
            reject((() => {
                this.callback = null;
                return msgHelper.reply('Successfully cancelled : ' + this.state)
            })());
        }
    });
};

Context.prototype.authenticate = function () {
    return disgame.getUser(this.discordId)
        .then(user => this._game = { user: user});
};

module.exports = Context;