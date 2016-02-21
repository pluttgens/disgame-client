'use strict';

function Node(elem, prev, next) {
    this.prev = prev;
    this.next = next;
    this.elem = elem;

    if (prev) {
        prev.next = this;
    }

    if (next) {
        next.prev = this;
    }
}

Node.prototype.isFirst = function () {
    return !this.prev;
};

Node.prototype.isLast =  function () {
    return !this.next;
};

module.exports = Node;