'use strict';

module.exports = function (handler) {
    handler
        .on('cancel', (msgHelper) => {
            msgHelper.reply('Nothing to cancel');
        });
};