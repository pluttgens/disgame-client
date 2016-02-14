'use strict';

module.exports = function (bot) {

    this.channelIDFromName = function (name, serverID) {
        var channels = Object.keys(bot.servers[serverID].channels);

        return channels.find(function (id) {
            return bot.servers[serverID].channels[id].name === name;
        });
    }
}
