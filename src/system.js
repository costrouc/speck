"use strict";

import * as glm from './gl-matrix/gl-matrix.js';
import { elements } from './elements.js';
import * as consts from './const.js';


export function System() {
    return {
        atoms: [],
        farAtom: undefined,
        bonds: []
    };
};


export function calculateBonds(s) {
    var bonds = [];
    var sorted = s.atoms.slice();
    sorted.sort(function(a, b) {
        return a.z - b.z;
    });
    for (var i = 0; i < sorted.length; i++) {
        var a = sorted[i];
        var j = i + 1;
        while(j < sorted.length && sorted[j].z < sorted[i].z + 2.5 * 2 * consts.MAX_ATOM_RADIUS) {
            var b = sorted[j];
            var l = glm.vec3.fromValues(a.x, a.y, a.z);
            var m = glm.vec3.fromValues(b.x, b.y, b.z);
            var d = glm.vec3.distance(l, m);
            var ea = elements[a.symbol];
            var eb = elements[b.symbol];
            if (d < 2.5*(ea.radius+eb.radius)) {
                bonds.push({
                    posA: {
                        x: a.x,
                        y: a.y,
                        z: a.z
                    },
                    posB: {
                        x: b.x,
                        y: b.y,
                        z: b.z
                    },
                    radA: ea.radius,
                    radB: eb.radius,
                    colA: {
                        r: ea.color[0],
                        g: ea.color[1],
                        b: ea.color[2]
                    },
                    colB: {
                        r: eb.color[0],
                        g: eb.color[1],
                        b: eb.color[2]
                    },
                    cutoff: d/(ea.radius+eb.radius)
                });
            }
            j++;
        }
    }
    bonds.sort(function(a, b) {
        return a.cutoff - b.cutoff;
    });
    s.bonds = bonds;
};


export function addAtom(s, symbol, x, y, z) {
    s.atoms.push({
        symbol: symbol,
        x: x,
        y: y,
        z: z
    });
};


export function getCentroid(s) {
    var xsum = 0;
    var ysum = 0;
    var zsum = 0;
    for (var i = 0; i < s.atoms.length; i++) {
        xsum += s.atoms[i].x;
        ysum += s.atoms[i].y;
        zsum += s.atoms[i].z;
    }
    return {
        x: xsum/s.atoms.length,
        y: ysum/s.atoms.length,
        z: zsum/s.atoms.length
    };
};


export function center(s) {
    var shift = getCentroid(s);
    for (var i = 0; i < s.atoms.length; i++) {
        var atom = s.atoms[i];
        atom.x -= shift.x;
        atom.y -= shift.y;
        atom.z -= shift.z;
    }
};


export function getFarAtom(s) {
    if (s.farAtom !== undefined) {
        return s.farAtom;
    }
    s.farAtom = s.atoms[0];
    var maxd = 0.0;
    for (var i = 0; i < s.atoms.length; i++) {
        var atom = s.atoms[i];
        var r = elements[atom.symbol].radius;
        var rd = Math.sqrt(r*r + r*r + r*r) * 2.5;
        var d = Math.sqrt(atom.x*atom.x + atom.y*atom.y + atom.z*atom.z) + rd;
        if (d > maxd) {
            maxd = d;
            s.farAtom = atom;
        }
    }
    return s.farAtom;
};


export function getRadius(s) {
    var atom = getFarAtom(s);
    var r = consts.MAX_ATOM_RADIUS;
    var rd = Math.sqrt(r*r + r*r + r*r) * 2.5;
    return Math.sqrt(atom.x*atom.x + atom.y*atom.y + atom.z*atom.z) + rd;
};
