'use strict';

function HandlerMock() {

}

HandlerMock.prototype.on = function () {
    return this;
};

module.exports = HandlerMock;