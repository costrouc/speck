'use strict';

import { elements } from './elements.js';

var MIN_ATOM_RADIUS = Infinity;
var MAX_ATOM_RADIUS = -Infinity;

for (var symbol in elements) {
    if (!elements.hasOwnProperty(symbol)) {
        //The current property is not a direct property of p
        continue;
    }
    MIN_ATOM_RADIUS = Math.min(MIN_ATOM_RADIUS, elements[symbol].radius);
    MAX_ATOM_RADIUS = Math.max(MAX_ATOM_RADIUS, elements[symbol].radius);
};

export { MIN_ATOM_RADIUS };
export { MAX_ATOM_RADIUS };
