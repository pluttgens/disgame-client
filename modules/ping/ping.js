'use strict';

module.exports = function (handler) {

    handler.on('ping', function (msgHelper) {
        msgHelper.doIfAllowed({ channel: true }, function (err) {
            if (err) {
                return console.log(err);
            }
            msgHelper.reply('pong');
        });
    });

}