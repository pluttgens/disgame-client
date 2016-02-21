Discord mmo client
===================

IMPORTANT
-------------

In order to run this, you need to also have access the server which runs the game. As we are still in early devlopment stages, it is not yet hosted and there should still be a few weeks before anyone can use it.
An api will be made available through a key and a secret. Pulling data will be allowed to any client that registered to the API and game sensitive operations will only be authorized to selected and trusted clients.

Installation :
-------------

 - npm
 ```
 npm install
 ```
 - node
 ```
 node app.js
 ```

Configuration :
-------------

check config.json at root.


Commands :
-------------
check help.json.

Useful links :
-------------
[discord-io](https://github.com/izy521/discord.io/wiki/)
[discord unoffical API doc](http://unofficial.discordapi.com/en/latest/)
[discord event structure](http://hornwitser.no/discord/analysis)

[Join the (unofficial) discord library dev server](https://discord.gg/0SBTUU1wZTVyGXpr)


Architecture :
-------------

```flow
disC=>start: Discord Client
disS=>operation: Discord Server
bot=>operation: Bot (Game client)
gameS=>end: Game Server

disC->disS->bot->gameS
```

This is a simplified schema of the architecture of the project. This repository is the bot.

`Discord Client` represents the discord users, they communicate directly with the `Discord Server`. The `Bot` communicates with the `Discord Server` through websockets and API calls. This is done using [discord-io](https://github.com/izy521/discord.io).
The `Bot` can retrieve game information and update game state through the RESTFUL API exposed by the `GAME SERVER`.

The Bot application flow
-------------

The `Bot` application uses the library [discord-io](https://github.com/izy521/discord.io) which expose a bot object wrapping API calls and socket events.

In order to understand what can be done with the library, you should check out its [wiki](https://github.com/izy521/discord.io/wiki).

### `handler`

For performance and maintainability issues, this application uses a `handler` to which `message` event callbacks are registered.
It is defined in `modules/main.js` and this is where you require other modules and give them the handler so they can register their callbacks.

example :
(ping.js)
```
module.exports = function (handler) {
    handler.on('ping', function (msgHelper) {
        msgHelper.doIfAllowed({ channel: true }, function (err) {
            if (err) {
                return winston.debug(err);
            }
            msgHelper.reply('pong');
        });
    });
}
```

(main.js)
```
require('./ping')(callbackHandler);
```


The `handler` object also keeps tracks of user `Contexts`. A `Context` is a simple object which serves as a cache for a given user.
A `Context` also has a `callback` property which is used during user/bot dialogues. In order to wait for a user response, you need to set the `Context.callback` property through the `Context.setCallback` method. Upon user input, the callback will be called with the `MessageHelper` wrapping the user response.

Example :

```
module.exports = function (handler) {
    handler.on('dialogue', (msgHandler) => {
        let context = handler.get(msgHandler.getAuthorID());

        context.setCallback((err, msgHelper) => {
            //Note : the following might end up being wrapped in an helper function in a close future.
            if (err) {
                // if the user reply "--cancel", { cancel: true } will be passed as the err parameter.
                if (err.cancel) {
                    return context.callback = null; //unregisters the callback.
                }
                return msgHelper.error(err); //logs the error and returns 'Internal Servor Error' to the user.
            }

            if (msgHelper.event.d.content === 'pong') { //access the raw event returned by discord
                return context.callback = null; // To end the dialogue, remove the callback waiting for an answer.
            }

            // If the function reaches this point, the user did not type pong and as the callback is still set, every future user inputs will be intercepted by this function until the user types "pong" or "--cancel".
        });

        // Once we set the callback waiting for the reply, we send the message to the user.
        msgHelper.reply('ping?');
    });
}
```

### `MessageHelper`

The `MessageHelper` is a wrapper of the `MESSAGE_CREATE` event sent by discord through the websocket.
It parses the raw message content and set its properties `command` and `params`. If the message is not a known command, it will be ignored unless a `Context.callback` is set for the user, which means we are waiting for his input.
It provides utility methods such as `reply` or `doIfAllowed`...

### `MessageBuffer`

The `MessageBuffer` is the object to use to send message to discord as it deals with the rate limit of 10 messages/10 seconds.
There is no way to know when a message written to the `MessageBuffer` will be sent, but the method `write` accepts a callback which will be fired once the message is sent.

Contributing :
-------------

The main way to contribute is to add `modules` with new features. Check the files in `modules` folder and the previous part to understand how it works.
Implementations improvement are welcome as long as they do not break everything else. Submit issues for suggestions.

The features that needs to be worked on are the following :

*coming soon*

Running :
-------------

*coming soon*

Tests :
-------------

*coming soon*
