'use strict';

const LinkedList = require('../utils/linkedList');

function Message(channel, user, content, callback) {
    this.id = this._id++;

    this.channel = channel;
    this.user = user;
    this.content = content;
    this.sent = false;
    this.callback = callback;

    if ((content + this._getMention()).length > this._CONTENT_MAX_LENGTH) {
        throw new Error('Message must be shorter than ' + (this._CONTENT_MAX_LENGTH - this._getMention()) + ' characters.');
    }
}

Message.prototype._id = 0;
Message.prototype._CONTENT_MAX_LENGTH = 2000;

Message.prototype.addMention = function () {
    if (!this.user && this._hasMention()) {
        return;
    }

    return this.content = this._getMention() + this.content;
};

Message.prototype.removeMention = function() {
    return this.content.replace(this._getMention(), '');
};

Message.prototype.getDest = function() {
    return this.isDirectMessage() ? this.user : this.channel;
};

Message.prototype.isDirectMessage = function() {
    return this.channel === null;
};

Message.prototype._getMention = function () {
    return '<@' + this.user + '>\n';
};

Message.prototype._hasMention = function() {
    return this.content.indexOf(this._getMention()) === 0;
};



function MessageBuffer(bot) {
    this._bot = bot;
    this._messageQueue = new LinkedList();
    this._waiting = false;
}

MessageBuffer.prototype.write = function (channel, user, content, callback) {
    this._messageQueue.add(new Message(channel, user, content, callback));
    if (!this._waiting) {
        this.readQueue();
    }
};

MessageBuffer.prototype._CONTENT_MAX_LENGTH = 2000;
MessageBuffer.prototype._NB_MAX_MESSAGE = 10;

MessageBuffer.prototype.readQueue = function () {
    const messages = {};
    const iterator = this._messageQueue.iterator();

    let message;
    while (((() => {
        message = iterator.next();
        return !message.done;
    })()) && (this._checkMessage(messages))) {
        message = message.value;

        if (message.sent) {
            continue;
        }


        message.sent = true;

        if (!messages[message.getDest()]) {
            messages[message.getDest()] = {
                charCount: 0,
                userIds: []
            };
        }

        let destMessages = messages[message.getDest()];


        if (!destMessages.content) {
            destMessages.content = [];
        }

        let isFirstUserMessage;
        if ((isFirstUserMessage = (destMessages.userIds.indexOf(message.user)) < 0) && !(message.channel in this._bot.directMessages)) {
            message.addMention();
        }

        if (message.content.length + destMessages.charCount >= this._CONTENT_MAX_LENGTH) {
            this._bot.sendMessage({
                to: message.getDest(),
                message: this.prettyPrint(destMessages)
            }, this._onMessageSent(destMessages.content));

            destMessages = {
                charCount: 0,
                userIds: [message.user]
            };
        } else {
            if (isFirstUserMessage) {
                destMessages.userIds.push(message.user)
            }
        }

        destMessages.content.push(message);
        destMessages.charCount += message.content.length;
    }

    Object.keys(messages).forEach(key => {
        this._bot.sendMessage({
            to: key,
            message: this.prettyPrint(messages[key].content)
        }, this._onMessageSent(messages[key].content));
    });
};

MessageBuffer.prototype._checkMessage = function (message) {
    return Object.keys(message).length <= this._NB_MAX_MESSAGE;
};

MessageBuffer.prototype._onMessageSent = function (messages) {
    return (err, response) => {
        messages.forEach(message => {
            if (message.callback) {
                message.callback(err, response);
            }
        });

        if (err) {
            if (err.statusCode !== 429) {
                return winston.info(err.message);
            }

            this._waiting = true;
            this._unsendMessages(messages);
            return setTimeout(() => {
                this.readQueue();
            }, err.response.retry_after);
        }

        this._waiting = false;
        this._cleanQueue(messages);
    };
};

MessageBuffer.prototype.prettyPrint = function(messages) {
    let msgByUser = {};

    messages.forEach(message=> {
        if (!msgByUser[message.user]) {
            msgByUser[message.user] = [];
        }

        msgByUser[message.user].push(message.content);
    });

    let ret = '';

    Object.keys(msgByUser).forEach(key => {
        ret +=  msgByUser[key].join('\n');
        ret += '\n\n';
    });

    return ret.slice(0, -2);
};

MessageBuffer.prototype._cleanQueue = function (messages) {
    messages.forEach(message => this._messageQueue.remove(message));
};

MessageBuffer.prototype._unsendMessages = function (messages) {
    messages.forEach(message => message.sent = false);
};

var messageBuffer;

module.exports = {
    construct: (bot) => {
        if (messageBuffer) {
            throw new Error('MessageBuffer is already constructed');
        }

        messageBuffer = new MessageBuffer(bot);
    },
    get: () => {
        if (!messageBuffer) {
            throw new Error('MessageBuffer not constructed yet');
        }

        return messageBuffer;
    }
};