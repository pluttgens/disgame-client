'use strict';

function MessageHelperMock(callback) {
    this.callback = callback;
}

MessageHelperMock.prototype.reply = function (message) {
    this.callback(message);
};

MessageHelperMock.prototype.doIfAllowed = function (options, callback) {
    callback();
};

module.exports = MessageHelperMock;