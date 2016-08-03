"use strict";

import * as glm from './gl-matrix/gl-matrix.js';
import { elements } from './elements.js';
import { config } from './presets.js';
import { extend } from './utils.js';
import * as consts from './const.js';


function clamp(min, max, value) {
    return Math.min(max, Math.max(min, value));
}


export function View() {
    return extend({
        aspect: 1.0,
        zoom: 0.125,
        translation: {
            x: 0.0,
            y: 0.0
        },
        rotation: glm.mat4.create(),
        resolution: 400
    }, config.atoms);
};


export function center(v, system) {
    var maxX = -Infinity;
    var minX = Infinity;
    var maxY = -Infinity;
    var minY = Infinity;
    for(var i = 0; i < system.atoms.length; i++) {
        var a = system.atoms[i];
        var r = elements[a.symbol].radius;
        r = 2.5 * v.atomScale * (1 + (r - 1) * v.relativeAtomScale);
        var p = glm.vec4.fromValues(a.x, a.y, a.z, 0);
        glm.vec4.transformMat4(p, p, v.rotation);
        maxX = Math.max(maxX, p[0] + r);
        minX = Math.min(minX, p[0] - r);
        maxY = Math.max(maxY, p[1] + r);
        minY = Math.min(minY, p[1] - r);
    }
    var cx = minX + (maxX - minX) / 2.0;
    var cy = minY + (maxY - minY) / 2.0;
    v.translation.x = cx;
    v.translation.y = cy;
    var scale = Math.max(maxX - minX, maxY - minY);
    v.zoom = 1/(scale * 1.01);
};


export function override(v, data) {
    for (var key in data) {
        v[key] = data[key];
    }
    resolve(v);
};


export function clone(v) {
    return deserialize(serialize(v));
};


export function serialize(v) {
    return JSON.stringify(v);
};


export function deserialize(v) {
    v = JSON.parse(v);
    v.rotation = glm.mat4.clone(v.rotation);
    return v;
};


export function resolve(v) {
    v.dofStrength = clamp(0, 1, v.dofStrength);
    v.dofPosition = clamp(0, 1, v.dofPosition);
    v.zoom = clamp(0.001, 2.0, v.zoom);
    v.atomScale = clamp(0, 1, v.atomScale);
    v.relativeAtomScale = clamp(0, 1, v.relativeAtomScale);
    v.bondScale = clamp(0, 1, v.bondScale);
    v.bondShade = clamp(0, 1, v.bondShade);
    v.atomShade = clamp(0, 1, v.atomShade);
    v.ao = clamp(0, 1, v.ao);
    v.brightness = clamp(0, 1, v.brightness);
    v.outline = clamp(0, 1, v.outline);
};


export function translate(v, dx, dy) {
    v.translation.x -= dx/(v.resolution * v.zoom);
    v.translation.y += dy/(v.resolution * v.zoom);
    resolve(v);
};


export function rotate(v, dx, dy) {
    var m = glm.mat4.create();
    glm.mat4.rotateY(m, m, dx * 0.005);
    glm.mat4.rotateX(m, m, dy * 0.005);
    glm.mat4.multiply(v.rotation, m, v.rotation);
    resolve(v);
};


export function getRect(v) {
    var width = 1.0/v.zoom;
    var height = width/v.aspect;
    var bottom = -height/2 + v.translation.y;
    var top = height/2 + v.translation.y;
    var left = -width/2 + v.translation.x;
    var right = width/2 + v.translation.x;
    return {
        bottom: bottom,
        top: top,
        left: left,
        right: right
    };
};


export function getBondRadius(v) {
    return v.bondScale * v.atomScale *
        (1 + (consts.MIN_ATOM_RADIUS - 1) * v.relativeAtomScale);
};
