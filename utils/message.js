'use strict';

function Message(message) {
    this.channel = message.channel || message.user;
    this.user = message.user;
    this.content = message.content;
    this.sent = false;

    if ((this.content + this._getMention()).length > this._CONTENT_MAX_LENGTH) {
        throw new Error('Message must be shorter than ' + (this._CONTENT_MAX_LENGTH - this._getMention()) + ' characters.');
    }
}
Message.prototype._CONTENT_MAX_LENGTH = 1995;

Message.prototype.addMention = function () {
    if (this.isDirectMessage() || this._hasMention()) {
        return;
    }

    return this.content = this._getMention() + this.content;
};

Message.prototype.removeMention = function() {
    this.content = this.content.replace(this._getMention(), '');
};

Message.prototype.isDirectMessage = function() {
    return this.channel === this.user;
};

Message.prototype._getMention = function () {
    return '<@' + this.user + '>\n';
};

Message.prototype._hasMention = function() {
    return this.content.indexOf(this._getMention()) === 0;
};

module.exports = Message;