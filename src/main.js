"use strict";

import "../bower_components/webcomponentsjs/webcomponents-lite.js";
import * as glm from './gl-matrix/gl-matrix.js';
import { xyz } from './io.js';
import { config } from './presets.js';
import { Renderer } from './renderer.js';
import { extend, ajax_get } from './utils.js';
import * as View from './view.js';
import * as System from './system.js';


var StructureViewProto = Object.create(HTMLElement.prototype);
StructureViewProto.createdCallback = function() {
    this.style.display = "inline-block";

    // var root = this.createShadowRoot();

    var resolution = Math.min(this.clientWidth, this.clientHeight);
    if (resolution < 100) {
        resolution = 100;
    }
    var canvas = document.createElement('canvas');
    canvas.width=resolution;
    canvas.height=resolution;
    canvas.style.cssText = "display: block; margin: auto;";
    this.appendChild(canvas);

    this._view =  View.View();
    this._view.resolution = resolution;
    this._state = {
        needReset: false,
        lastX: 0.0,
        lastY: 0.0,
        buttonDown: false
    };

    add_event_handlers(this);

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
        this.readStructure(this.getAttribute('src'), this.getAttribute('format'));
    }
};


StructureViewProto.readStructure = function(url, format) {
    var extension = url.split('.').slice(-1)[0];
    if (format && ['xyz'].indexOf(format) >= 0) {
        extension = format;
    } else if (format) {
        throw "Unrecognized structure format: " + format;
    }
    var that = this;
    if (extension === 'xyz') {
        ajax_get(url, function(content) {
            var data = xyz(content)[0]; //grab first frame for now
            that.loadStructure({atoms: data});
        }, function(){
            throw "Unable to load file from url";
        });
    } else {
        throw "Unrecognized filename extension for src!";
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
    this._state.needReset = true;

    render(this);
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
        this._state.needReset = true;
    } else if (attrName === "lattice") {
        if (this.hasAttribute("lattice")) {
            System.calculateLattice(this._system);
            this._view.lattice = true;
        } else {
            this._view.lattice = false;
        }
        View.resolve(this._view);
        this._renderer.setSystem(this._system, this._view);
        this._state.needReset = true;
    } else if (attrName === "src") {
        if (this.hasAttribute('src')) {
            this.readStructure(this.getAttribute('src'), this.getAttribute('format'));
        }
    }
};


var StructureView = document.registerElement('structure-view', {
    prototype: StructureViewProto
});


function render(speck) {
    if (speck._state.needReset) {
        speck._renderer.reset();
        speck._state.needReset = false;
    }
    speck._renderer.render(speck._view);
    requestAnimationFrame(function(){
        render(speck);
    });
};


function add_event_handlers(speck) {
    speck.addEventListener('mousedown', function(e) {
        document.body.style.cursor = "none";
        if (e.button == 0) {
            speck._state.buttonDown = true;
        }
        speck._state.lastX = e.clientX;
        speck._state.lastY = e.clientY;
    });

    window.addEventListener("mouseup", function(e) {
        document.body.style.cursor = "";
        if (e.button == 0) {
            speck._state.buttonDown = false;
        }
    });

    setInterval(function() {
        if (!speck._state.buttonDown) {
            document.body.style.cursor = "";
        }
    }, 10);

    window.addEventListener("mousemove", function(e) {
        if ((speck.clientWidth != speck._state.width) || (speck.clientHeight != speck._state.height)) {
            speck.dispatchEvent(new CustomEvent("resize-canvas", {"detail": "resize canvas"}));
        }

        speck._state.width = speck.clientWidth;
        speck._state.height = speck.clientHeight;

        if (!speck._state.buttonDown) {
            return;
        }

        var dx = e.clientX - speck._state.lastX;
        var dy = e.clientY - speck._state.lastY;
        if (dx == 0 && dy == 0) {
            return;
        }
        speck._state.lastX = e.clientX;
        speck._state.lastY = e.clientY;
        if (e.shiftKey) {
            View.translate(speck._view, dx, dy);
        } else {
            View.rotate(speck._view, dx, dy);
        }
        speck._state.needReset = true;
    });

    speck.addEventListener("wheel", function(e) {
        var wd = 0;
        if (e.deltaY < 0) {
            wd = 1;
        }
        else {
            wd = -1;
        }
        speck._view.zoom = speck._view.zoom * (wd === 1 ? 1/0.9 : 0.9);
        View.resolve(speck._view);
        speck._state.needReset = true;

        e.preventDefault();
    });

    speck.addEventListener("resize-canvas", function(e) {
        var resolution = Math.min(speck.clientWidth, speck.clientHeight);
        if (resolution < 100) {
            resolution = 100;
        }
        speck._view.resolution = resolution;
        View.resolve(speck._view);
        speck._renderer.setResolution(speck._view.resolution, speck._view.aoRes);
        speck._state.needReset = true;
    });
}
