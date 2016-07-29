var n = -1;
var p = 1;

export var position = [
    // -X
    n, n, n,
    n, n, p,
    n, p, p,
    n, n, n,
    n, p, p,
    n, p, n,

    // +X
    p, n, p,
    p, n, n,
    p, p, n,
    p, n, p,
    p, p, n,
    p, p, p,

    // -Y
    n, n, n,
    p, n, n,
    p, n, p,
    n, n, n,
    p, n, p,
    n, n, p,

    // +Y
    n, p, p,
    p, p, p,
    p, p, n,
    n, p, p,
    p, p, n,
    n, p, n,

    // -Z
    p, n, n,
    n, n, n,
    n, p, n,
    p, n, n,
    n, p, n,
    p, p, n,

    // +Z
    n, n, p,
    p, n, p,
    p, p, p,
    n, n, p,
    p, p, p,
    n, p, p
];

export var normal = [
    // -X
    n, 0, 0,
    n, 0, 0,
    n, 0, 0,
    n, 0, 0,
    n, 0, 0,
    n, 0, 0,

    // +X
    p, 0, 0,
    p, 0, 0,
    p, 0, 0,
    p, 0, 0,
    p, 0, 0,
    p, 0, 0,

    // -Y
    0, n, 0,
    0, n, 0,
    0, n, 0,
    0, n, 0,
    0, n, 0,
    0, n, 0,

    // +Y
    0, p, 0,
    0, p, 0,
    0, p, 0,
    0, p, 0,
    0, p, 0,
    0, p, 0,

    // -Z
    0, 0, n,
    0, 0, n,
    0, 0, n,
    0, 0, n,
    0, 0, n,
    0, 0, n,

    // +Z
    0, 0, p,
    0, 0, p,
    0, 0, p,
    0, 0, p,
    0, 0, p,
    0, 0, p
];
