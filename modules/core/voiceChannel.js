// 'use strict';
// 
// const MsgHelper = require('../../helpers/messages');
// const ResolverHelper = require('../../helpers/resolvers');
// 
// module.exports = function (bot) {
// 
//     const msgHelper = new MsgHelper(bot);
//     const resolverHelper = new ResolverHelper(bot);
// 
//     bot.on('message', function (user, userID, channelID, message, rawEvent) {
// 
//         msgHelper
//             .setChannelID(channelID)
//             .setUserID(userID);
// 
//         const serverID = bot.serverFromChannel(channelID);
// 
//         var params = msgHelper.parse(message);
// 
//         if (!params) {
//             return;
//         }
// 
//         if (params[0] === 'join') {
//             msgHelper.doIfAllowed({ admin: true }, function (err) {
//                 if (err) {
//                     return console.log(err);
//                 }
// 
//                 const targetChannel = params.slice(1, params.length).join(' ');
//                 var targetChannelID = resolverHelper.channelIDFromName(targetChannel, serverID);
// 
// 
//                 if (!targetChannelID) {
//                     return msgHelper.sendToSameChannel('Unable to join ' + targetChannel + '.');
//                 }
// 
//                 bot.joinVoiceChannel(targetChannelID);
//             });
//         }
// 
//         if (params[0] === 'play') {
//             msgHelper.doIfAllowed({ admin: true }, function (err) {
//                 if (err) {
//                     return console.log(err);
//                 }
// 
//                 const targetChannel = params.slice(1, params.length).join(' ');
//                 var targetChannelID = resolverHelper.channelIDFromName(targetChannel, serverID);
// 
//                 if (!targetChannelID) {
//                     return msgHelper.sendToSameChannel('Unable to play in ' + targetChannel + '.');
//                 }
// 
//                 bot.getAudioContext(targetChannelID, function (stream) {
//                     stream.playAudioFile('z.mp3');
//                     stream.on('fileEnd', function () {
//                         stream.playAudioFile('a.mp3');
//                     })
//                 });
//             });
//         }
// 
//         if (params[0] === 'leave') {
//             msgHelper.doIfAllowed({ admin: true }, function (err) {
//                 if (err) {
//                     return;
//                 }
// 
//                 const targetChannel = params.slice(1, params.length).join(' ');
//                 var targetChannelID = resolverHelper.channelIDFromName(targetChannel, serverID);
// 
//                 if (!targetChannelID) {
//                     return msgHelper.sendToSameChannel('Unable to leave ' + targetChannel + '.');
//                 }
// 
//                 bot.leaveVoiceChannel(targetChannelID);
//             });
//         }
//     });
// }