"use strict";

import * as glm from './gl-matrix/gl-matrix.js';

import { elements } from './elements.js';
import * as consts from './const.js';


export function System() {
    return {
        atoms: [],
        farAtom: undefined,
        bonds: [],
        lattice: {}
    };
};

export function calculateLattice(s){
    var l = s.lattice.matrix;
    var lattice_color = [0.1, 0.1, 0.1];
    var lattice_radius = 0.03;
    s.lattice.edges = [];
    s.lattice.points = [];

    function add_edge(p1, p2) {
        s.lattice.edges.push({
            posA: {x: p1[0], y: p1[1], z: p1[2]},
            posB: {x: p2[0], y: p2[1], z: p2[2]},
            radA: lattice_radius, radB: lattice_radius,
            colA: {r: lattice_color[0], g: lattice_color[1], b: lattice_color[2]},
            colB: {r: lattice_color[0], g: lattice_color[1], b: lattice_color[2]},
            cutoff: 1.0
        });
    };

    function add_point(p1) {
        s.lattice.points.push({
            position: p1,
            color: lattice_color,
            radius: lattice_radius
        });
    }

    // Do calculation to find lattice unless specified
    var o = [l[3], l[7], l[11]]; //offset
    var v000 = glm.vec3.fromValues(0+o[0], 0+o[1], 0+o[2]);
    var v100 = glm.vec3.fromValues(l[0]+o[0], l[1]+o[1], l[2]+o[2]);
    var v010 = glm.vec3.fromValues(l[4]+o[0], l[5]+o[1], l[6]+o[2]);
    var v001 = glm.vec3.fromValues(l[8]+o[0], l[9]+o[1], l[10]+o[2]);
    var v110 = glm.vec3.fromValues(l[0]+l[4]+o[0], l[1]+l[5]+o[1], l[2]+l[6]+o[2]);
    var v101 = glm.vec3.fromValues(l[0]+l[8]+o[0], l[1]+l[9]+o[1], l[2]+l[10]+o[2]);
    var v011 = glm.vec3.fromValues(l[4]+l[8]+o[0], l[5]+l[9]+o[1], l[6]+l[10]+o[2]);
    var v111 = glm.vec3.fromValues(l[0]+l[4]+l[8]+o[0], l[1]+l[5]+l[9]+o[1], l[2]+l[6]+l[10]+o[2]);
    add_point(v000);
    add_point(v100); add_point(v010); add_point(v001);
    add_point(v110); add_point(v101); add_point(v011);
    add_point(v111);

    add_edge(v000, v100); add_edge(v000, v010); add_edge(v000, v001);
    add_edge(v110, v010); add_edge(v110, v100); add_edge(v110, v111);
    add_edge(v011, v111); add_edge(v011, v001); add_edge(v011, v010);
    add_edge(v101, v001); add_edge(v101, v111); add_edge(v101, v100);
}

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

    s.lattice.matrix[3] -= shift.x;
    s.lattice.matrix[7] -= shift.y;
    s.lattice.matrix[11] -= shift.z;
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
