'use strict';
const Promise = require('bluebird');
const winston = require('winston');

module.exports = function (handler) {

    handler
        .on('ping', ping);

    function ping(msgHelper) {
        const MAX = 25;
        return msgHelper
            .doIfAllowed({ channel: true })
            .then(() => msgHelper.params)
            .get(0)
            .then(n => {
                if (!n) return msgHelper.reply('pong');
                if (n > MAX) return Promise.reject();
                const promises = [];
                for (let i = 0 ; i < n ; ++i) promises.push(msgHelper.reply('pong'));
                return promises;
            });
    }

    return {
        ping: ping
    };
};