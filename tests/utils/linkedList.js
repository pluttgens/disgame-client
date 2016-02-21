'use strict';

const should = require('should');
const Node = require('../../utils/node');
const LinkedList = require('../../utils/linkedList');

module.exports = function () {
    describe('LinkedList', function () {
        describe('#LinkedList()', function () {
            let linkedList = new LinkedList();

            it('Should have its properties set to null.', function () {
                should.not.exist(linkedList._first);
                should.not.exist(linkedList._last);
            });
        });

        describe('#add', function() {
            it('Should return a new Node wrapping the added element.', function () {
                let linkedList = new LinkedList();
                let elem = 'elem';
                let actual = linkedList.add(elem);
                let expected = new Node(elem);
                should.notStrictEqual(actual, expected);
            });

            it('Should have its properties set to the only added element.', function () {
                let linkedList = new LinkedList();
                linkedList.add(2);

                should.notStrictEqual(linkedList._first, new Node(2));
                should.notStrictEqual(linkedList._last, new Node(2));
            });
        });
    });
};