'use strict';
const Promise = require('bluebird');
const LinkedList = require('./linkedList');
const Message = require('./message');

function MessageBuffer(bot) {
    this._bot = bot;
    this._sendMessage = Promise.promisify(this._bot.sendMessage);
    this._messageQueue = new LinkedList();
    this._isWaiting = false;
}

MessageBuffer.prototype._CONTENT_MAX_LENGTH = 2000;
MessageBuffer.prototype._NB_MAX_MESSAGE = 10;

MessageBuffer.prototype.write = function (message) {
    return new Promise((resolve, reject) => {
        const messageObject = this._messageQueue.add(new Message(message)).elem;
        messageObject.resolve = resolve;
        messageObject.reject = reject;
        if (!this._isWaiting) this._flush();
    });
};

MessageBuffer.prototype._flush = function () {
    const messages = { nChan: 0, channelMessages: {}};
    const iterator = this._messageQueue.iterator();

    let message;
    while (((() => {
        message = iterator.next();
        return !message.done;
    })()) && (this._checkMessage(messages))) {
        message = message.value;
        if (message.sent) continue;
        let channelMessages = this._getChannelMessages(messages, message.channel);
        if (!channelMessages) break;
        if (!channelMessages.userMessages[message.user]) message.addMention();
        channelMessages.nChar += message.content.length;
        channelMessages = this._getChannelMessages(messages, message.channel);
        if (!channelMessages) break;
        const userMessages = this._getUserMessages(channelMessages, message.user);
        userMessages.push(message);
    }

    Object.keys(messages.channelMessages).forEach(channel => {
        messages.channelMessages[channel].forEach(channelMessage => {
            const finalMessage = this._prettyPrint(channelMessage.userMessages);
            this._userMessagesForEach(channelMessage.userMessages, message => message.sent = true);
            this._sendMessage({
                to: channel,
                message: finalMessage
            }).bind(this)
                .then((response) => this._userMessagesForEach(channelMessage.userMessages, this._onMessageSent(response).bind(this)))
                .catch({statusCode: 429}, err => {
                    this._isWaiting = true;
                    setTimeout(() => {
                        this._flush();
                        this._isWaiting = false;
                    }, err.response.retry_after);
                    return Promise.reject(err);
                })
                .catch((err) => this._userMessagesForEach(channelMessage.userMessages, this._onMessageNotSent.bind(this)));
        });
    });
};

MessageBuffer.prototype._getChannelMessages = function (messages, channel) {
    if (!messages.channelMessages[channel]) {
        ++messages.nChan;
        return messages.nChan > this._NB_MAX_MESSAGE ? null : (messages.channelMessages[channel] = [{ nChar: 0, userMessages: {} }])[0];
    }
    return messages.channelMessages[channel].find(message => message.nChar < this._CONTENT_MAX_LENGTH) ||
        (() => {
            ++messages.nChan;
            return messages.nChan > this._NB_MAX_MESSAGE ? null : messages.channelMessages[channel][messages.channelMessages[channel].push({ nChar: 0, userMessages: {} }) - 1];
        })();
};

MessageBuffer.prototype._getUserMessages = function (channel, user) {
    return channel.userMessages[user] || (channel.userMessages[user] = []);
};

MessageBuffer.prototype._checkMessage = function (message) {
    return Object.keys(message).length <= this._NB_MAX_MESSAGE;
};

MessageBuffer.prototype._prettyPrint = function (userMessages) {
    let finalMessage = '';
    Object.keys(userMessages).forEach(user => {
        userMessages[user].forEach(message => finalMessage += message.content + '\n');
        finalMessage += '\n\n';
    });
    return finalMessage.substring(0, finalMessage.length - 3);
};

MessageBuffer.prototype._userMessagesForEach = function (userMessages, apply) {
    Object.keys(userMessages).forEach(user => {
        userMessages[user].forEach(apply);
    });
};

MessageBuffer.prototype._onMessageSent = function(response) {
    return (message) => {
        this._messageQueue.remove(message);
        message.resolve(response);
    };
};

MessageBuffer.prototype._onMessageNotSent = function (message) {
    message.removeMention();
    message.sent = false;
};

module.exports = MessageBuffer;