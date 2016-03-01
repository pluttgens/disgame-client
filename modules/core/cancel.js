'use strict';

module.exports = function (handler) {
    handler
        .on('cancel', cancel);

    function cancel (msgHelper)  {
        return msgHelper.reply('Nothing to cancel');
    }

    return {
        cancel: cancel
    };
};