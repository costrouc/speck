"use strict";

import * as glm from './gl-matrix/gl-matrix.js';
import { xyz } from './io.js';
import { config } from './presets.js';
import { Renderer } from './renderer.js';
import { extend, ajax_get } from './utils.js';
import * as View from './view.js';
import * as System from './system.js';

var needReset = false;

//Global event variables
var lastX = 0.0;
var lastY = 0.0;
var buttonDown = false;

var StructureViewProto = Object.create(HTMLElement.prototype);
StructureViewProto.createdCallback = function() {
    var root = this.createShadowRoot();

    var canvas = document.createElement('canvas');
    root.appendChild(canvas);

    this._view =  View.View();
    add_event_handlers(canvas, this._view);

    // Rendering pipeline
    this._renderer = new Renderer(canvas, this._view.resolution, this._view.aoRes);
    this._renderer.setResolution(this._view.resolution, this._view.aoRes);
    this._system = System.System();

    if (this.hasAttribute('lattice')) {
        this._view.lattice = true;
    } else {
        this._view.lattice = false;
    }

    if (this.hasAttribute('bonds')) {
        this._view.bonds = true;
        this._view = extend(this._view, config.atomsbonds);
    } else {
        this._view.bonds = false;
    }
    View.resolve(this._view);

    if (this.hasAttribute('src')) {
        var src = this.getAttribute('src');
        var extension = src.split('.').slice(-1)[0];
        if (extension === 'xyz') {
            var that = this;
            ajax_get(src, function(content) {
                var data = xyz(content)[0]; //grab first frame for now
                that.loadStructure({atoms: data});
            });
        } else {
            throw "Unrecognized filename extension for src!";
        }
    }
};

StructureViewProto.loadStructure = function(data) {
    // Expects objects of {lattice: 3x3, atoms: Nx3}
    // lattice is not required
    this._system = System.System();

    var minx = Infinity,
        miny = Infinity,
        minz = Infinity,
        maxx = -Infinity,
        maxy = -Infinity,
        maxz = -Infinity;

    for (var i = 0; i < data.atoms.length; i++) {
        var atom = data.atoms[i];
        var x = atom.position[0];
        var y = atom.position[1];
        var z = atom.position[2];

        if (x < minx) minx = x;
        if (y < miny) miny = y;
        if (z < minz) minz = z;
        if (x > maxx) maxx = x;
        if (y > maxy) maxy = y;
        if (z > maxz) maxz = z;

        System.addAtom(this._system, atom.symbol, x, y, z);
    }

    if (data.lattice) {
        var l = data.lattice;
        this._system.lattice.matrix = glm.mat4.fromValues(
            l[0], l[1], l[2], 0,
            l[3], l[4], l[5], 0,
            l[6], l[7], l[8], 0,
            0, 0, 0, 1);

    } else {
        this._system.lattice.matrix = glm.mat4.fromValues(
            maxx-minx, 0, 0, minx,
            0, maxy-miny, 0, miny,
            0, 0, maxz-minz, minz,
            0, 0, 0, 1);
    }

    System.center(this._system);

    if (this._view.lattice) {
        System.calculateLattice(this._system);
    }

    if (this._view.bonds) {
        System.calculateBonds(this._system);
    }

    this._renderer.setSystem(this._system, this._view);
    View.center(this._view, this._system);
    needReset = true;

    render(this._view, this._renderer);
};


StructureViewProto.attributeChangedCallback = function(attrName, oldValue, newValue) {
    if (attrName === "bonds") {
        if (this.hasAttribute("bonds")) {
            System.calculateBonds(this._system);
            this._view.bonds = true;
            this._view = extend(this._view, config.atomsbonds);
        } else {
            this._view.bonds = false;
            this._view = extend(this._view, config.atoms);
        }
        View.resolve(this._view);
        this._renderer.setSystem(this._system, this._view);
        needReset = true;
    } else if (attrName === "lattice") {
        if (this.hasAttribute("lattice")) {
            System.calculateLattice(this._system);
            this._view.lattice = true;
        } else {
            this._view.lattice = false;
        }
        View.resolve(this._view);
        this._renderer.setSystem(this._system, this._view);
        needReset = true;
    } else if (attrName === "src") {
        var src = this.getAttribute('src');
        var extension = src.split('.').slice(-1)[0];
        if (extension === 'xyz') {
            var that = this;
            ajax_get(src, function(content) {
                var data = xyz(content)[0]; //grab first frame for now
                that.loadStructure({atoms: data});
            });
        } else {
            throw "Unrecognized filename extension for src!";
        }
    }
};

var StructureView = document.registerElement('structure-view', {
    prototype: StructureViewProto
});


function render(view, renderer) {
    if (needReset) {
        renderer.reset();
        needReset = false;
    }
    renderer.render(view);
    requestAnimationFrame(function(){
        render(view, renderer);
    });
};


function add_event_handlers(canvas, view) {
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
