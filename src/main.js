"use strict";

import { Renderer } from './renderer.js';
import * as View from './view.js';
import * as System from './system.js';

var needReset = false;

//event variables
var lastX = 0.0;
var lastY = 0.0;
var buttonDown = false;

export function add_event_handlers(canvas, view) {
    canvas.addEventListener('mousedown', function(e) {
        document.body.style.cursor = "none";
        if (e.button == 0) {
            buttonDown = true;
        }
        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener("mouseup", function(e) {
        document.body.style.cursor = "";
        if (e.button == 0) {
            buttonDown = false;
        }
    });

    setInterval(function() {
        if (!buttonDown) {
            document.body.style.cursor = "";
        }
    }, 10);

    window.addEventListener("mousemove", function(e) {
        if (!buttonDown) {
            return;
        }
        var dx = e.clientX - lastX;
        var dy = e.clientY - lastY;
        if (dx == 0 && dy == 0) {
            return;
        }
        lastX = e.clientX;
        lastY = e.clientY;
        if (e.shiftKey) {
            View.translate(view, dx, dy);
        } else {
            View.rotate(view, dx, dy);
        }
        needReset = true;
    });

    canvas.addEventListener("wheel", function(e) {
        var wd = 0;
        if (e.deltaY < 0) {
            wd = 1;
        }
        else {
            wd = -1;
        }
        view.zoom = view.zoom * (wd === 1 ? 1/0.9 : 0.9);
        View.resolve(view);
        needReset = true;

        e.preventDefault();
    });
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
