'use strict';

const should = require('should');
const Node = require('../../utils/node');

module.exports = function () {
    describe('Node', function () {
        describe('#Node()', function() {
            it('Should have all its properties either undefined or null.', function () {
                let node = new Node();

                should.not.exist(node.prev, '#prev');
                should.not.exist(node.next, '#next');
                should.not.exist(node.elem, '#elem');
            });
        });

        describe('#Node(elem, prev, next)', function () {
            let prev = new Node(2);
            let next = new Node(3);
            let node = new Node(1, prev, next);

            it('Should have its #elem and #prev properties set.', function () {
                should.exist(node.prev, '#prev');
                should.exist(node.next, '#next');
                should.exist(node.elem, '#elem');
            });

            it('Should have set #prev#next to itself.', function () {
                should.strictEqual(node.prev.next, node, '#prev#next');
            });

            it('Should have set #next#prev to itself1.', function () {
                should.strictEqual(node.next.prev, node, '#next#prev');
            });
        });

        describe('#isFirst()', function() {
            it('Should return true.', function () {
                let node = new Node(1);

                should.ok(node.isFirst());
            });


            it('Should only return true for #prev.', function () {
                let prev = new Node(2);
                let next = new Node(3);
                let node = new Node(1, prev, next);
                (node.isFirst()).should.not.be.true();
                (node.prev.isFirst()).should.be.true();
                (node.next.isFirst()).should.not.be.true();
            });
        });

        describe('#isLast()', function() {
            it('Should return true.', function () {
                let node = new Node(1);

                should.ok(node.isLast());
            });

            it('Should only return true for #next.', function() {
                let prev = new Node(2);
                let next = new Node(3);
                let node = new Node(1, prev, next);

                (node.isLast()).should.not.be.true();
                (node.prev.isLast()).should.not.be.true();
                (node.next.isLast()).should.be.true();
            });
        });
    });
};