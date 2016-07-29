"use strict";

import { Renderer } from './renderer.js';
import * as View from './view.js';
import * as System from './system.js';

var needReset = false;

export function hello() {
    console.log('Hello World!');
}

export function init_view() {
    view = View.View();
    return view;
}


export function init_renderer(node) {
    var renderer = new Renderer(node, view.resolution, view.aoRes);

    return renderer;
}


export function loadStructure(data, view, renderer) {
    var system = System.System();
    for (var i = 0; i < data.length; i++) {
        var atom = data[i];
        var x = atom.position[0];
        var y = atom.position[1];
        var z = atom.position[2];
        System.addAtom(system, atom.symbol, x, y, z);
    }
    System.center(system);
    System.calculateBonds(system);
    renderer.setSystem(system, view);
    View.center(view, system);
    needReset = true;

    return system;
}


export function animation_loop(view, renderer) {
    if (needReset) {
        renderer.reset();
        needReset = false;
    }
    renderer.render(view);
    requestAnimationFrame(function(){
        animation_loop(view, renderer);
    });
}


// Not really needed
// export * from './presets.js';
