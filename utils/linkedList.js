'use strict';

const Node = require('./node');

function LinkedList() {
    this._first = null;
    this._last = null;
}

LinkedList.prototype.add = function (e) {
    if (!this._first) {
        return this._first = this._last = new Node(e);
    }

    return this._last = this._last.next = new Node(e, this._last);
};

LinkedList.prototype.get = function (e) {
    if (!this._first) {
        return null;
    }

    let iterator = this._iterator();
    let curr;

    if (typeof e === 'function') {
        while ((() => {curr = iterator.next(); return !curr.done;})()) {
            curr = curr.value;
            if (e(curr.elem)) {
                return curr.elem;
            }
        }
        return null;
    }

    while ((() => {curr = iterator.next(); return !curr.done;})()) {
        curr = curr.value;
        if (e === curr.elem) {
            return e;
        }
    }

    return null;
};


LinkedList.prototype._get = function (e) {
    if (!this._first) {
        return null;
    }

    let iterator = this._iterator();
    let curr;

    if (typeof e === 'function') {
        while ((() => {curr = iterator.next(); return !curr.done;})()) {
            curr = curr.value;
            if (e(curr.elem)) return curr;
        }
        return null;
    }

    while ((() => {curr = iterator.next(); return !curr.done;})()) {
        curr = curr.value;
        if (e === curr.elem) {
            return curr;
        }
    }

    return null;
};

LinkedList.prototype.iterator = function* () {
    let curr = this._first;
    yield curr.elem;

    while (curr = curr.next) {
        yield curr.elem;
    }
};

LinkedList.prototype._iterator = function* () {
    let curr = this._first;
    yield curr;

    while (curr = curr.next) {
        yield curr;
    }
};

LinkedList.prototype.remove = function (e) {
    let elem = this._get(e);

    if (!elem) {
        return;
    }

    if (elem.isLast() && elem.isFirst()) {
        this._first = this._last = null;
        return;
    }

    if (!elem.isLast()) {
        elem.next.prev = elem.prev;
        if (!elem.prev) {
            this._first = elem.next;
        }
    }

    if (!elem.isFirst()) {
        elem.prev.next = elem.next;
        if (!elem.next) {
            this._last = elem.prev;
        }
    }
};

module.exports = LinkedList;