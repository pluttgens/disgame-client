'use strict';

function Node(elem, prev) {
    this.prev = prev;
    this.next = null;
    this.elem = elem;
}

Node.prototype.isFirst = function () {
    return !this.prev;
};

Node.prototype.isLast =  function () {
    return !this.next;
};

module.exports = Node;