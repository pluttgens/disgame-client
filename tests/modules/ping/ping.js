'use strict';

const should = require('should');
const HandlerMock = require('../../mocks/HandlerMock');
const MessageHelperMock = require('../../mocks/MessageHelperMock');
const Ping = require('../../../modules/ping/ping')(new HandlerMock());

module.exports = function () {
    describe('ping', function () {
        it('should return pong', function (done) {
            Ping.ping(new MessageHelperMock((message) => {
                should.equal(message, 'pong');
                done();
            }));
        });
    });
};