'use strict';

module.exports = function (handler) {
    require('./users')(handler);
    require('./characters')(handler);
};