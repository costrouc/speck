(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, function () { 'use strict';

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */

	/**
	 * Common utilities
	 * @module glMatrix
	 */

	// Configuration Constants
	const EPSILON = 0.000001;
	let ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
	const RANDOM = Math.random;
	const ENABLE_SIMD = false;

	// Capability detection
	const SIMD_AVAILABLE = (ARRAY_TYPE === Float32Array) && (typeof SIMD !== 'undefined');
	const USE_SIMD = ENABLE_SIMD && SIMD_AVAILABLE;

	/**
	 * 3x3 Matrix
	 * @module mat3
	 */

	/**
	 * Creates a new identity mat3
	 *
	 * @returns {mat3} a new 3x3 matrix
	 */
	function create$2() {
	    var out = new ARRAY_TYPE(9);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	};

	/**
	 * Inverts a mat4 not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	function invert$4(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32,

	        // Calculate the determinant
	        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;

	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

	    return out;
	};

	/**
	 * Multiplies two mat4's explicitly not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the first operand
	 * @param {mat4} b the second operand
	 * @returns {mat4} out
	 */
	function multiply$4(out, a, b) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

	    // Cache only the current line of the second matrix
	    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
	    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
	    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
	    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	    return out;
	};

	/**
	 * Translate a mat4 by the given vector not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to translate
	 * @param {vec3} v vector to translate by
	 * @returns {mat4} out
	 */
	function translate$3(out, a, v) {
	    var x = v[0], y = v[1], z = v[2],
	        a00, a01, a02, a03,
	        a10, a11, a12, a13,
	        a20, a21, a22, a23;

	    if (a === out) {
	        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
	        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
	        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
	        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
	    } else {
	        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
	        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
	        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

	        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
	        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
	        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

	        out[12] = a00 * x + a10 * y + a20 * z + a[12];
	        out[13] = a01 * x + a11 * y + a21 * z + a[13];
	        out[14] = a02 * x + a12 * y + a22 * z + a[14];
	        out[15] = a03 * x + a13 * y + a23 * z + a[15];
	    }

	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the X axis not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	function rotateX$1(out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a10 = a[4],
	        a11 = a[5],
	        a12 = a[6],
	        a13 = a[7],
	        a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];

	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[0]  = a[0];
	        out[1]  = a[1];
	        out[2]  = a[2];
	        out[3]  = a[3];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }

	    // Perform axis-specific matrix multiplication
	    out[4] = a10 * c + a20 * s;
	    out[5] = a11 * c + a21 * s;
	    out[6] = a12 * c + a22 * s;
	    out[7] = a13 * c + a23 * s;
	    out[8] = a20 * c - a10 * s;
	    out[9] = a21 * c - a11 * s;
	    out[10] = a22 * c - a12 * s;
	    out[11] = a23 * c - a13 * s;
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the Y axis not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	function rotateY$1(out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a00 = a[0],
	        a01 = a[1],
	        a02 = a[2],
	        a03 = a[3],
	        a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];

	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[4]  = a[4];
	        out[5]  = a[5];
	        out[6]  = a[6];
	        out[7]  = a[7];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }

	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c - a20 * s;
	    out[1] = a01 * c - a21 * s;
	    out[2] = a02 * c - a22 * s;
	    out[3] = a03 * c - a23 * s;
	    out[8] = a00 * s + a20 * c;
	    out[9] = a01 * s + a21 * c;
	    out[10] = a02 * s + a22 * c;
	    out[11] = a03 * s + a23 * c;
	    return out;
	};

	/**
	 * Inverts a mat4 using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	function invert$5(out, a) {
	  var row0, row1, row2, row3,
	      tmp1,
	      minor0, minor1, minor2, minor3,
	      det,
	      a0 = SIMD.Float32x4.load(a, 0),
	      a1 = SIMD.Float32x4.load(a, 4),
	      a2 = SIMD.Float32x4.load(a, 8),
	      a3 = SIMD.Float32x4.load(a, 12);

	  // Compute matrix adjugate
	  tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
	  row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
	  row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
	  row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);
	  tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
	  row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
	  row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
	  row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);

	  tmp1   = SIMD.Float32x4.mul(row2, row3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor0 = SIMD.Float32x4.mul(row1, tmp1);
	  minor1 = SIMD.Float32x4.mul(row0, tmp1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
	  minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
	  minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);

	  tmp1   = SIMD.Float32x4.mul(row1, row2);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
	  minor3 = SIMD.Float32x4.mul(row0, tmp1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
	  minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
	  minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);

	  tmp1   = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  row2   = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
	  minor2 = SIMD.Float32x4.mul(row0, tmp1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
	  minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
	  minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);

	  tmp1   = SIMD.Float32x4.mul(row0, row1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
	  minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
	  minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));

	  tmp1   = SIMD.Float32x4.mul(row0, row3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
	  minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
	  minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));

	  tmp1   = SIMD.Float32x4.mul(row0, row2);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
	  minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
	  minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);

	  // Compute matrix determinant
	  det   = SIMD.Float32x4.mul(row0, minor0);
	  det   = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 2, 3, 0, 1), det);
	  det   = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 1, 0, 3, 2), det);
	  tmp1  = SIMD.Float32x4.reciprocalApproximation(det);
	  det   = SIMD.Float32x4.sub(
	               SIMD.Float32x4.add(tmp1, tmp1),
	               SIMD.Float32x4.mul(det, SIMD.Float32x4.mul(tmp1, tmp1)));
	  det   = SIMD.Float32x4.swizzle(det, 0, 0, 0, 0);
	  if (!det) {
	      return null;
	  }

	  // Compute matrix inverse
	  SIMD.Float32x4.store(out, 0,  SIMD.Float32x4.mul(det, minor0));
	  SIMD.Float32x4.store(out, 4,  SIMD.Float32x4.mul(det, minor1));
	  SIMD.Float32x4.store(out, 8,  SIMD.Float32x4.mul(det, minor2));
	  SIMD.Float32x4.store(out, 12, SIMD.Float32x4.mul(det, minor3));
	  return out;
	}

	/**
	 * Multiplies two mat4's explicitly using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the first operand, must be a Float32Array
	 * @param {mat4} b the second operand, must be a Float32Array
	 * @returns {mat4} out
	 */
	function multiply$5(out, a, b) {
	    var a0 = SIMD.Float32x4.load(a, 0);
	    var a1 = SIMD.Float32x4.load(a, 4);
	    var a2 = SIMD.Float32x4.load(a, 8);
	    var a3 = SIMD.Float32x4.load(a, 12);

	    var b0 = SIMD.Float32x4.load(b, 0);
	    var out0 = SIMD.Float32x4.add(
	                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 0, 0, 0, 0), a0),
	                   SIMD.Float32x4.add(
	                       SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 1, 1, 1, 1), a1),
	                       SIMD.Float32x4.add(
	                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 2, 2, 2, 2), a2),
	                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 3, 3, 3, 3), a3))));
	    SIMD.Float32x4.store(out, 0, out0);

	    var b1 = SIMD.Float32x4.load(b, 4);
	    var out1 = SIMD.Float32x4.add(
	                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 0, 0, 0, 0), a0),
	                   SIMD.Float32x4.add(
	                       SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 1, 1, 1, 1), a1),
	                       SIMD.Float32x4.add(
	                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 2, 2, 2, 2), a2),
	                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 3, 3, 3, 3), a3))));
	    SIMD.Float32x4.store(out, 4, out1);

	    var b2 = SIMD.Float32x4.load(b, 8);
	    var out2 = SIMD.Float32x4.add(
	                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 0, 0, 0, 0), a0),
	                   SIMD.Float32x4.add(
	                       SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 1, 1, 1, 1), a1),
	                       SIMD.Float32x4.add(
	                               SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 2, 2, 2, 2), a2),
	                               SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 3, 3, 3, 3), a3))));
	    SIMD.Float32x4.store(out, 8, out2);

	    var b3 = SIMD.Float32x4.load(b, 12);
	    var out3 = SIMD.Float32x4.add(
	                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 0, 0, 0, 0), a0),
	                   SIMD.Float32x4.add(
	                        SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 1, 1, 1, 1), a1),
	                        SIMD.Float32x4.add(
	                            SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 2, 2, 2, 2), a2),
	                            SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 3, 3, 3, 3), a3))));
	    SIMD.Float32x4.store(out, 12, out3);

	    return out;
	};

	/**
	 * Translates a mat4 by the given vector using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to translate
	 * @param {vec3} v vector to translate by
	 * @returns {mat4} out
	 */
	function translate$4(out, a, v) {
	    var a0 = SIMD.Float32x4.load(a, 0),
	        a1 = SIMD.Float32x4.load(a, 4),
	        a2 = SIMD.Float32x4.load(a, 8),
	        a3 = SIMD.Float32x4.load(a, 12),
	        vec = SIMD.Float32x4(v[0], v[1], v[2] , 0);

	    if (a !== out) {
	        out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
	        out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
	        out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11];
	    }

	    a0 = SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0));
	    a1 = SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1));
	    a2 = SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2));

	    var t0 = SIMD.Float32x4.add(a0, SIMD.Float32x4.add(a1, SIMD.Float32x4.add(a2, a3)));
	    SIMD.Float32x4.store(out, 12, t0);

	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the X axis using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	function rotateX$2(out, a, rad) {
	    var s = SIMD.Float32x4.splat(Math.sin(rad)),
	        c = SIMD.Float32x4.splat(Math.cos(rad));

	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	      out[0]  = a[0];
	      out[1]  = a[1];
	      out[2]  = a[2];
	      out[3]  = a[3];
	      out[12] = a[12];
	      out[13] = a[13];
	      out[14] = a[14];
	      out[15] = a[15];
	    }

	    // Perform axis-specific matrix multiplication
	    var a_1 = SIMD.Float32x4.load(a, 4);
	    var a_2 = SIMD.Float32x4.load(a, 8);
	    SIMD.Float32x4.store(out, 4,
	                         SIMD.Float32x4.add(SIMD.Float32x4.mul(a_1, c), SIMD.Float32x4.mul(a_2, s)));
	    SIMD.Float32x4.store(out, 8,
	                         SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_2, c), SIMD.Float32x4.mul(a_1, s)));
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the Y axis using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	function rotateY$2(out, a, rad) {
	    var s = SIMD.Float32x4.splat(Math.sin(rad)),
	        c = SIMD.Float32x4.splat(Math.cos(rad));

	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[4]  = a[4];
	        out[5]  = a[5];
	        out[6]  = a[6];
	        out[7]  = a[7];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }

	    // Perform axis-specific matrix multiplication
	    var a_0 = SIMD.Float32x4.load(a, 0);
	    var a_2 = SIMD.Float32x4.load(a, 8);
	    SIMD.Float32x4.store(out, 0,
	                         SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_0, c), SIMD.Float32x4.mul(a_2, s)));
	    SIMD.Float32x4.store(out, 8,
	                         SIMD.Float32x4.add(SIMD.Float32x4.mul(a_0, s), SIMD.Float32x4.mul(a_2, c)));
	    return out;
	};

	/**
	 * 4x4 Matrix
	 * @module mat4
	 */

	/**
	 * Creates a new identity mat4
	 *
	 * @returns {mat4} a new 4x4 matrix
	 */
	function create$3() {
	    var out = new ARRAY_TYPE(16);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};

	/**
	 * Creates a new mat4 initialized with values from an existing matrix
	 *
	 * @param {mat4} a matrix to clone
	 * @returns {mat4} a new 4x4 matrix
	 */
	function clone$3(a) {
	    var out = new ARRAY_TYPE(16);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};

	/**
	 * Create a new mat4 with the given values
	 *
	 * @param {Number} m00 Component in column 0, row 0 position (index 0)
	 * @param {Number} m01 Component in column 0, row 1 position (index 1)
	 * @param {Number} m02 Component in column 0, row 2 position (index 2)
	 * @param {Number} m03 Component in column 0, row 3 position (index 3)
	 * @param {Number} m10 Component in column 1, row 0 position (index 4)
	 * @param {Number} m11 Component in column 1, row 1 position (index 5)
	 * @param {Number} m12 Component in column 1, row 2 position (index 6)
	 * @param {Number} m13 Component in column 1, row 3 position (index 7)
	 * @param {Number} m20 Component in column 2, row 0 position (index 8)
	 * @param {Number} m21 Component in column 2, row 1 position (index 9)
	 * @param {Number} m22 Component in column 2, row 2 position (index 10)
	 * @param {Number} m23 Component in column 2, row 3 position (index 11)
	 * @param {Number} m30 Component in column 3, row 0 position (index 12)
	 * @param {Number} m31 Component in column 3, row 1 position (index 13)
	 * @param {Number} m32 Component in column 3, row 2 position (index 14)
	 * @param {Number} m33 Component in column 3, row 3 position (index 15)
	 * @returns {mat4} A new mat4
	 */
	function fromValues$3(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
	    var out = new ARRAY_TYPE(16);
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m02;
	    out[3] = m03;
	    out[4] = m10;
	    out[5] = m11;
	    out[6] = m12;
	    out[7] = m13;
	    out[8] = m20;
	    out[9] = m21;
	    out[10] = m22;
	    out[11] = m23;
	    out[12] = m30;
	    out[13] = m31;
	    out[14] = m32;
	    out[15] = m33;
	    return out;
	};

	/**
	 * Set a mat4 to the identity matrix
	 *
	 * @param {mat4} out the receiving matrix
	 * @returns {mat4} out
	 */
	function identity$3(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};

	const invert$3 = USE_SIMD ? invert$5 : invert$4;
	const multiply$3 = USE_SIMD ? multiply$5 : multiply$4;

	const translate$2 = USE_SIMD ? translate$4 : translate$3;

	/**
	 * Rotates a mat4 by the given angle around the given axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @param {vec3} axis the axis to rotate around
	 * @returns {mat4} out
	 */
	function rotate$3(out, a, rad, axis) {
	    var x = axis[0], y = axis[1], z = axis[2],
	        len = Math.sqrt(x * x + y * y + z * z),
	        s, c, t,
	        a00, a01, a02, a03,
	        a10, a11, a12, a13,
	        a20, a21, a22, a23,
	        b00, b01, b02,
	        b10, b11, b12,
	        b20, b21, b22;

	    if (Math.abs(len) < EPSILON) { return null; }

	    len = 1 / len;
	    x *= len;
	    y *= len;
	    z *= len;

	    s = Math.sin(rad);
	    c = Math.cos(rad);
	    t = 1 - c;

	    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
	    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
	    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

	    // Construct the elements of the rotation matrix
	    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
	    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
	    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

	    // Perform rotation-specific matrix multiplication
	    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
	    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
	    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
	    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
	    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
	    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
	    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
	    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
	    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
	    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
	    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
	    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	    return out;
	};

	const rotateX = USE_SIMD ? rotateX$2 : rotateX$1;
	const rotateY = USE_SIMD ? rotateY$2 : rotateY$1;
	/**
	 * Generates a orthogonal projection matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} left Left bound of the frustum
	 * @param {number} right Right bound of the frustum
	 * @param {number} bottom Bottom bound of the frustum
	 * @param {number} top Top bound of the frustum
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	function ortho(out, left, right, bottom, top, near, far) {
	    var lr = 1 / (left - right),
	        bt = 1 / (bottom - top),
	        nf = 1 / (near - far);
	    out[0] = -2 * lr;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = -2 * bt;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 2 * nf;
	    out[11] = 0;
	    out[12] = (left + right) * lr;
	    out[13] = (top + bottom) * bt;
	    out[14] = (far + near) * nf;
	    out[15] = 1;
	    return out;
	};

	/**
	 * Generates a look-at matrix with the given eye position, focal point, and up axis
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {vec3} eye Position of the viewer
	 * @param {vec3} center Point the viewer is looking at
	 * @param {vec3} up vec3 pointing up
	 * @returns {mat4} out
	 */
	function lookAt(out, eye, center, up) {
	    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
	        eyex = eye[0],
	        eyey = eye[1],
	        eyez = eye[2],
	        upx = up[0],
	        upy = up[1],
	        upz = up[2],
	        centerx = center[0],
	        centery = center[1],
	        centerz = center[2];

	    if (Math.abs(eyex - centerx) < EPSILON &&
	        Math.abs(eyey - centery) < EPSILON &&
	        Math.abs(eyez - centerz) < EPSILON) {
	        return identity$3(out);
	    }

	    z0 = eyex - centerx;
	    z1 = eyey - centery;
	    z2 = eyez - centerz;

	    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	    z0 *= len;
	    z1 *= len;
	    z2 *= len;

	    x0 = upy * z2 - upz * z1;
	    x1 = upz * z0 - upx * z2;
	    x2 = upx * z1 - upy * z0;
	    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	    if (!len) {
	        x0 = 0;
	        x1 = 0;
	        x2 = 0;
	    } else {
	        len = 1 / len;
	        x0 *= len;
	        x1 *= len;
	        x2 *= len;
	    }

	    y0 = z1 * x2 - z2 * x1;
	    y1 = z2 * x0 - z0 * x2;
	    y2 = z0 * x1 - z1 * x0;

	    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	    if (!len) {
	        y0 = 0;
	        y1 = 0;
	        y2 = 0;
	    } else {
	        len = 1 / len;
	        y0 *= len;
	        y1 *= len;
	        y2 *= len;
	    }

	    out[0] = x0;
	    out[1] = y0;
	    out[2] = z0;
	    out[3] = 0;
	    out[4] = x1;
	    out[5] = y1;
	    out[6] = z1;
	    out[7] = 0;
	    out[8] = x2;
	    out[9] = y2;
	    out[10] = z2;
	    out[11] = 0;
	    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	    out[15] = 1;

	    return out;
	};

	/**
	 * 3 Dimensional Vector
	 * @module vec3
	 */

	/**
	 * Creates a new, empty vec3
	 *
	 * @returns {vec3} a new 3D vector
	 */
	function create$5() {
	    var out = new ARRAY_TYPE(3);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    return out;
	};

	/**
	 * Creates a new vec3 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @returns {vec3} a new 3D vector
	 */
	function fromValues$5(x, y, z) {
	    var out = new ARRAY_TYPE(3);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	};

	/**
	 * Calculates the euclidian distance between two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} distance between a and b
	 */
	function distance(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2];
	    return Math.sqrt(x*x + y*y + z*z);
	};

	/**
	 * Calculates the length of a vec3
	 *
	 * @param {vec3} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	function length$1(a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    return Math.sqrt(x*x + y*y + z*z);
	};

	/**
	 * Normalize a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to normalize
	 * @returns {vec3} out
	 */
	function normalize$1(out, a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    var len = x*x + y*y + z*z;
	    if (len > 0) {
	        //TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	        out[2] = a[2] * len;
	    }
	    return out;
	};

	/**
	 * Calculates the dot product of two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	function dot$1(a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	};

	/**
	 * Computes the cross product of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	function cross(out, a, b) {
	    var ax = a[0], ay = a[1], az = a[2],
	        bx = b[0], by = b[1], bz = b[2];

	    out[0] = ay * bz - az * by;
	    out[1] = az * bx - ax * bz;
	    out[2] = ax * by - ay * bx;
	    return out;
	};

	/**
	 * Generates a random vector with the given scale
	 *
	 * @param {vec3} out the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
	 * @returns {vec3} out
	 */
	function random(out, scale) {
	    scale = scale || 1.0;

	    var r = RANDOM() * 2.0 * Math.PI;
	    var z = (RANDOM() * 2.0) - 1.0;
	    var zScale = Math.sqrt(1.0-z*z) * scale;

	    out[0] = Math.cos(r) * zScale;
	    out[1] = Math.sin(r) * zScale;
	    out[2] = z * scale;
	    return out;
	};

	/**
	 * Perform some operation over an array of vec3s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	const forEach = (function() {
	    var vec = create$5();

	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 3;
	        }

	        if(!offset) {
	            offset = 0;
	        }

	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }

	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
	        }

	        return a;
	    };
	})();

	/**
	 * 4 Dimensional Vector
	 * @module vec4
	 */

	/**
	 * Creates a new, empty vec4
	 *
	 * @returns {vec4} a new 4D vector
	 */
	function create$6() {
	    var out = new ARRAY_TYPE(4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    return out;
	};

	/**
	 * Creates a new vec4 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {vec4} a new 4D vector
	 */
	function fromValues$6(x, y, z, w) {
	    var out = new ARRAY_TYPE(4);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	};

	/**
	 * Normalize a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to normalize
	 * @returns {vec4} out
	 */
	function normalize$2(out, a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    var len = x*x + y*y + z*z + w*w;
	    if (len > 0) {
	        len = 1 / Math.sqrt(len);
	        out[0] = x * len;
	        out[1] = y * len;
	        out[2] = z * len;
	        out[3] = w * len;
	    }
	    return out;
	};

	/**
	 * Transforms the vec4 with a mat4.
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec4} out
	 */
	function transformMat4$1(out, a, m) {
	    var x = a[0], y = a[1], z = a[2], w = a[3];
	    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	    return out;
	};

	/**
	 * Perform some operation over an array of vec4s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	const forEach$1 = (function() {
	    var vec = create$6();

	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 4;
	        }

	        if(!offset) {
	            offset = 0;
	        }

	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }

	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
	        }

	        return a;
	    };
	})();

	/**
	 * Quaternion
	 * @module quat
	 */

	/**
	 * Creates a new identity quat
	 *
	 * @returns {quat} a new quaternion
	 */
	function create$4() {
	    var out = new ARRAY_TYPE(4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};

	/**
	 * Sets a quaternion to represent the shortest rotation from one
	 * vector to another.
	 *
	 * Both vectors are assumed to be unit length.
	 *
	 * @param {quat} out the receiving quaternion.
	 * @param {vec3} a the initial vector
	 * @param {vec3} b the destination vector
	 * @returns {quat} out
	 */
	const rotationTo = (function() {
	    var tmpvec3 = create$5();
	    var xUnitVec3 = fromValues$5(1,0,0);
	    var yUnitVec3 = fromValues$5(0,1,0);

	    return function(out, a, b) {
	        var dot = dot$1(a, b);
	        if (dot < -0.999999) {
	            cross(tmpvec3, xUnitVec3, a);
	            if (length$1(tmpvec3) < 0.000001)
	                cross(tmpvec3, yUnitVec3, a);
	            normalize$1(tmpvec3, tmpvec3);
	            setAxisAngle(out, tmpvec3, Math.PI);
	            return out;
	        } else if (dot > 0.999999) {
	            out[0] = 0;
	            out[1] = 0;
	            out[2] = 0;
	            out[3] = 1;
	            return out;
	        } else {
	            cross(tmpvec3, a, b);
	            out[0] = tmpvec3[0];
	            out[1] = tmpvec3[1];
	            out[2] = tmpvec3[2];
	            out[3] = 1 + dot;
	            return normalize(out, out);
	        }
	    };
	})();

	/**
	 * Sets the specified quaternion with values corresponding to the given
	 * axes. Each axis is a vec3 and is expected to be unit length and
	 * perpendicular to all other specified axes.
	 *
	 * @param {vec3} view  the vector representing the viewing direction
	 * @param {vec3} right the vector representing the local "right" direction
	 * @param {vec3} up    the vector representing the local "up" direction
	 * @returns {quat} out
	 */
	const setAxes = (function() {
	    var matr = create$2();

	    return function(out, view, right, up) {
	        matr[0] = right[0];
	        matr[3] = right[1];
	        matr[6] = right[2];

	        matr[1] = up[0];
	        matr[4] = up[1];
	        matr[7] = up[2];

	        matr[2] = -view[0];
	        matr[5] = -view[1];
	        matr[8] = -view[2];

	        return normalize(out, fromMat3(out, matr));
	    };
	})();

	/**
	 * Sets a quat from the given angle and rotation axis,
	 * then returns it.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {vec3} axis the axis around which to rotate
	 * @param {Number} rad the angle in radians
	 * @returns {quat} out
	 **/
	function setAxisAngle(out, axis, rad) {
	    rad = rad * 0.5;
	    var s = Math.sin(rad);
	    out[0] = s * axis[0];
	    out[1] = s * axis[1];
	    out[2] = s * axis[2];
	    out[3] = Math.cos(rad);
	    return out;
	};

	/**
	 * Performs a spherical linear interpolation between two quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {quat} out
	 */
	function slerp(out, a, b, t) {
	    // benchmarks:
	    //    http://jsperf.com/quaternion-slerp-implementations

	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = b[0], by = b[1], bz = b[2], bw = b[3];

	    var        omega, cosom, sinom, scale0, scale1;

	    // calc cosine
	    cosom = ax * bx + ay * by + az * bz + aw * bw;
	    // adjust signs (if necessary)
	    if ( cosom < 0.0 ) {
	        cosom = -cosom;
	        bx = - bx;
	        by = - by;
	        bz = - bz;
	        bw = - bw;
	    }
	    // calculate coefficients
	    if ( (1.0 - cosom) > 0.000001 ) {
	        // standard case (slerp)
	        omega  = Math.acos(cosom);
	        sinom  = Math.sin(omega);
	        scale0 = Math.sin((1.0 - t) * omega) / sinom;
	        scale1 = Math.sin(t * omega) / sinom;
	    } else {
	        // "from" and "to" quaternions are very close
	        //  ... so we can do a linear interpolation
	        scale0 = 1.0 - t;
	        scale1 = t;
	    }
	    // calculate final values
	    out[0] = scale0 * ax + scale1 * bx;
	    out[1] = scale0 * ay + scale1 * by;
	    out[2] = scale0 * az + scale1 * bz;
	    out[3] = scale0 * aw + scale1 * bw;

	    return out;
	};

	/**
	 * Performs a spherical linear interpolation with two control points
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {quat} c the third operand
	 * @param {quat} d the fourth operand
	 * @param {Number} t interpolation amount
	 * @returns {quat} out
	 */
	const sqlerp = (function () {
	  var temp1 = create$4();
	  var temp2 = create$4();

	  return function (out, a, b, c, d, t) {
	    slerp(temp1, a, d, t);
	    slerp(temp2, b, c, t);
	    slerp(out, temp1, temp2, 2 * t * (1 - t));

	    return out;
	  };
	}());

	/**
	 * Normalize a quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quaternion to normalize
	 * @returns {quat} out
	 * @function
	 */
	const normalize = normalize$2;

	/**
	 * Creates a quaternion from the given 3x3 rotation matrix.
	 *
	 * NOTE: The resultant quaternion is not normalized, so you should be sure
	 * to renormalize the quaternion yourself where necessary.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {mat3} m rotation matrix
	 * @returns {quat} out
	 * @function
	 */
	function fromMat3(out, m) {
	    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	    // article "Quaternion Calculus and Fast Animation".
	    var fTrace = m[0] + m[4] + m[8];
	    var fRoot;

	    if ( fTrace > 0.0 ) {
	        // |w| > 1/2, may as well choose w > 1/2
	        fRoot = Math.sqrt(fTrace + 1.0);  // 2w
	        out[3] = 0.5 * fRoot;
	        fRoot = 0.5/fRoot;  // 1/(4w)
	        out[0] = (m[5]-m[7])*fRoot;
	        out[1] = (m[6]-m[2])*fRoot;
	        out[2] = (m[1]-m[3])*fRoot;
	    } else {
	        // |w| <= 1/2
	        var i = 0;
	        if ( m[4] > m[0] )
	          i = 1;
	        if ( m[8] > m[i*3+i] )
	          i = 2;
	        var j = (i+1)%3;
	        var k = (i+2)%3;

	        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
	        out[i] = 0.5 * fRoot;
	        fRoot = 0.5 / fRoot;
	        out[3] = (m[j*3+k] - m[k*3+j]) * fRoot;
	        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
	        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
	    }

	    return out;
	};

	/**
	 * 2 Dimensional Vector
	 * @module vec2
	 */

	/**
	 * Creates a new, empty vec2
	 *
	 * @returns {vec2} a new 2D vector
	 */
	function create$7() {
	    var out = new ARRAY_TYPE(2);
	    out[0] = 0;
	    out[1] = 0;
	    return out;
	};

	/**
	 * Perform some operation over an array of vec2s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	const forEach$2 = (function() {
	    var vec = create$7();

	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 2;
	        }

	        if(!offset) {
	            offset = 0;
	        }

	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }

	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1];
	        }

	        return a;
	    };
	})();

	function xyz(data) {
	    var lines = data.split('\n');
	    var natoms = parseInt(lines[0]);
	    var nframes = Math.floor(lines.length/(natoms+2));
	    var trajectory = [];
	    for(var i = 0; i < nframes; i++) {
	        var atoms = [];
	        for(var j = 0; j < natoms; j++) {
	            var line = lines[i*(natoms+2)+j+2].split(/\s+/);
	            var atom = {};
	            var k = 0;
	            while (line[k] == "") k++;
	            atom.symbol = line[k++];
	            atom.position = [parseFloat(line[k++]), parseFloat(line[k++]), parseFloat(line[k++])];
	            atoms.push(atom);
	        }
	        trajectory.push(atoms);
	    }
	    return trajectory;
	}

	var config = {
	    atoms: {
	        atomScale: 0.6,
	        relativeAtomScale: 0.64, // 1.0,
	        bondScale: 0.5,
	        ao: 0.75,
	        aoRes: 256,
	        brightness: 0.5,
	        outline: 0.0,
	        spf: 32,
	        bondThreshold: 1.2,
	        bondShade: 0.5,
	        atomShade: 0.5,
	        dofStrength: 0.0,
	        dofPosition: 0.5,
	        fxaa: 1
	    },
	    atomsbonds: {
	        atomScale: 0.24,
	        relativeAtomScale: 0.64,
	        bondScale: 0.5,
	        bondThreshold: 1.2
	    },
	    toon: {
	        ao: 0,
	        spf: 0,
	        brightness: 0.5,
	        outline: 1
	    },
	    licorice: {
	        atomScale: 0.1,
	        relativeAtomScale: 0,
	        bondScale: 1,
	        bonds: true,
	        bondThreshold: 1.2
	    }
	};

	function buildAttribs(gl, layout) {
	    var attribs = {};
	    for (var key in layout) {
	        attribs[key] = {
	            buffer: new GLBuffer(gl),
	            size: layout[key]
	        };
	    }
	    return attribs;
	}


	function getExtensions(gl, extArray) {
	    var ext = {};
	    for (var i = 0; i < extArray.length; i++) {
	        var e = gl.getExtension(extArray[i]);
	        if (e === null) {
	            throw "Extension " + extArray[i] + " not available.";
	        }
	        ext[extArray[i]] = e;
	    }
	    return ext;
	};


	function Framebuffer(gl, color, depth, ext) {

	    var self = this;

	    self.initialize = function() {
	        self.fb = gl.createFramebuffer();
	        self.bind();
	        if (color.length > 1) {
	            var drawBuffers = [];
	            for (var i = 0; i < color.length; i++) {
	                drawBuffers.push(ext["COLOR_ATTACHMENT" + i + "_WEBGL"]);
	            }
	            ext.drawBuffersWEBGL(drawBuffers);
	            for (var i = 0; i < color.length; i++) {
	                gl.framebufferTexture2D(gl.FRAMEBUFFER, ext["COLOR_ATTACHMENT" + i + "_WEBGL"],
	                    gl.TEXTURE_2D, color[i].texture, 0);
	            }
	        } else {
	            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color[0].texture, 0);
	        }
	        if (depth !== undefined) {
	            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth.texture, 0);
	        }
	    };

	    self.bind = function() {
	        gl.bindFramebuffer(gl.FRAMEBUFFER, self.fb);
	    };

	    self.initialize();

	};


	function Texture(gl, index, data, width, height, options) {
	    options = options || {};
	    options.target = options.target || gl.TEXTURE_2D;
	    options.mag = options.mag || gl.NEAREST;
	    options.min = options.min || gl.NEAREST;
	    options.wraps = options.wraps || gl.CLAMP_TO_EDGE;
	    options.wrapt = options.wrapt || gl.CLAMP_TO_EDGE;
	    options.internalFormat = options.internalFormat || gl.RGBA;
	    options.format = options.format || gl.RGBA;
	    options.type = options.type || gl.UNSIGNED_BYTE;

	    var self = this;

	    self.initialize = function() {
	        self.index = index;
	        self.activate();
	        self.texture = gl.createTexture();
	        self.bind();
	        gl.texParameteri(options.target, gl.TEXTURE_MAG_FILTER, options.mag);
	        gl.texParameteri(options.target, gl.TEXTURE_MIN_FILTER, options.min);
	        gl.texParameteri(options.target, gl.TEXTURE_WRAP_S, options.wraps);
	        gl.texParameteri(options.target, gl.TEXTURE_WRAP_T, options.wrapt);
	        gl.texImage2D(options.target, 0, options.internalFormat, width, height,
	            0, options.format, options.type, data);
	    };

	    self.bind = function() {
	        gl.bindTexture(options.target, self.texture);
	    };

	    self.activate = function() {
	        gl.activeTexture(gl.TEXTURE0 + self.index);
	    };

	    self.reset = function() {
	        self.activate();
	        self.bind();
	        gl.texImage2D(options.target, 0, options.internalFormat, width, height,
	            0, options.format, options.type, data);
	    };

	    self.initialize();
	}


	function GLBuffer(gl) {

	    var self = this;

	    self.initialize = function() {
	        self.buffer = gl.createBuffer();
	    };

	    self.bind = function() {
	        gl.bindBuffer(gl.ARRAY_BUFFER, self.buffer);
	    };

	    self.set = function(data) {
	        self.bind();
	        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	    };

	    self.initialize();
	};


	function Renderable(gl, program, buffers, primitiveCount) {

	    var self = this;

	    self.primitiveCount = primitiveCount;

	    self.initialize = function() {
	    };

	    self.render = function() {
	        program.use();
	        for (name in buffers) {
	            var buffer = buffers[name].buffer;
	            var size = buffers[name].size;
	            try {
	                var location = program.attribs[name].location;
	            } catch (e) {
	                console.log("Could not find location for", name);
	                throw e;
	            }
	            buffer.bind();
	            gl.enableVertexAttribArray(location);
	            gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
	        }
	        gl.drawArrays(gl.TRIANGLES, 0, 3 * primitiveCount);
	        for (name in self.buffers) {
	            gl.disableVertexAttribArray(program.attributes[name].location);
	        }
	    };

	    self.initialize();
	};


	function Program(gl, vertexSource, fragmentSource) {

	    var self = this;

	    self.initialize = function() {
	        self.program = self.compileProgram(vertexSource, fragmentSource);
	        self.attribs = self.gatherAttribs();
	        self.uniforms = self.gatherUniforms();
	    };

	    self.use = function() {
	        gl.useProgram(self.program);
	    };

	    self.compileProgram = function(vertexSource, fragmentSource) {
	        var vertexShader = self.compileShader(vertexSource, gl.VERTEX_SHADER);
	        var fragmentShader = self.compileShader(fragmentSource, gl.FRAGMENT_SHADER);
	        var program = gl.createProgram();
	        gl.attachShader(program, vertexShader);
	        gl.attachShader(program, fragmentShader);
	        gl.linkProgram(program);
	        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	            console.log(gl.getProgramInfoLog(program));
	            throw "Failed to compile program.";
	        }
	        return program;
	    };

	    self.compileShader = function(source, type) {
	        var shader = gl.createShader(type);
	        gl.shaderSource(shader, source);
	        gl.compileShader(shader);
	        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	            var err = gl.getShaderInfoLog(shader);
	            var lineno = parseInt(err.split(':')[2]);
	            var split = source.split("\n");
	            for (var i in split) {
	                var q = parseInt(i);
	                console.log(q + "  " + split[i]);
	                if (i == lineno - 1) {
	                    console.warn(err);
	                }
	            }
	            var typeString = type == gl.VERTEX_SHADER ? "vertex" : "fragment";
	            throw "Failed to compile " + typeString + " shader.";
	        }
	        return shader;
	    };

	    self.setUniform = function(name, type, value) {
	        var args = Array.prototype.slice.call(arguments, 2);
	        self.use(); // Make this idempotent. At the context level, perhaps?
	        try {
	            var location = self.uniforms[name].location;
	        }
	        catch(e) {
	            console.log(name);
	            throw e;
	        }
	        gl['uniform' + type].apply(gl, [location].concat(args));
	    };

	    self.gatherUniforms = function() {
	        var uniforms = {};
	        var nUniforms = gl.getProgramParameter(self.program, gl.ACTIVE_UNIFORMS);
	        for (var i = 0; i < nUniforms; i++) {
	            var uniform = gl.getActiveUniform(self.program, i);
	            uniforms[uniform.name] = {
	                name: uniform.name,
	                location: gl.getUniformLocation(self.program, uniform.name),
	                type: uniform.type,
	                size: uniform.size
	            };
	        }
	        return uniforms;
	    };

	    self.gatherAttribs = function() {
	        var attribs = {};
	        var nAttribs = gl.getProgramParameter(self.program, gl.ACTIVE_ATTRIBUTES);
	        for (var i = 0; i < nAttribs; i++) {
	            var attrib = gl.getActiveAttrib(self.program, i);
	            attribs[attrib.name] = {
	                name: attrib.name,
	                location: gl.getAttribLocation(self.program, attrib.name),
	                type: attrib.type,
	                size: attrib.size
	            };
	        }
	        return attribs;
	    };

	    self.initialize();
	};

	var atoms = "#version 100\nprecision highp float;\n\nattribute vec3 aImposter;\nattribute vec3 aPosition;\nattribute float aRadius;\nattribute vec3 aColor;\n\nuniform mat4 uView;\nuniform mat4 uProjection;\nuniform mat4 uModel;\nuniform float uAtomScale;\nuniform float uRelativeAtomScale;\nuniform float uAtomShade;\n\nvarying vec3 vColor;\nvarying vec3 vPosition;\nvarying float vRadius;\n\nvoid main() {\n    vRadius = uAtomScale * (1.0 + (aRadius - 1.0) * uRelativeAtomScale);\n    gl_Position = uProjection * uView * uModel * vec4(vRadius * aImposter + aPosition, 1.0);\n    vColor = mix(aColor, vec3(1,1,1), uAtomShade);\n    vPosition = vec3(uModel * vec4(aPosition, 1));\n}\n\n\n// __split__\n\n\n#version 100\n#extension GL_EXT_frag_depth: enable\nprecision highp float;\n\nuniform vec2 uBottomLeft;\nuniform vec2 uTopRight;\nuniform float uRes;\nuniform float uDepth;\nuniform int uMode;\n\nvarying vec3 vPosition;\nvarying float vRadius;\nvarying vec3 vColor;\n\nvec2 res = vec2(uRes, uRes);\n\nfloat raySphereIntersect(vec3 r0, vec3 rd) {\n    float a = dot(rd, rd);\n    vec3 s0_r0 = r0 - vPosition;\n    float b = 2.0 * dot(rd, s0_r0);\n    float c = dot(s0_r0, s0_r0) - (vRadius * vRadius);\n    float disc = b*b - 4.0*a*c;\n    if (disc <= 0.0) {\n        return -1.0;\n    }\n    return (-b - sqrt(disc))/(2.0*a);\n}\n\nvoid main() {\n    vec3 r0 = vec3(uBottomLeft + (gl_FragCoord.xy/res) * (uTopRight - uBottomLeft), 0.0);\n    vec3 rd = vec3(0, 0, -1);\n    float t = raySphereIntersect(r0, rd);\n    if (t < 0.0) {\n        discard;\n    }\n    vec3 coord = r0 + rd * t;\n    vec3 normal = normalize(coord - vPosition);\n    if (uMode == 0) {\n        gl_FragColor = vec4(vColor, 1);\n    } else if (uMode == 1) {\n        gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);\n    }\n    gl_FragDepthEXT = -coord.z/uDepth;\n}\n";

	var bonds = "#version 100\nprecision highp float;\n\nattribute vec3 aImposter;\nattribute vec3 aPosA;\nattribute vec3 aPosB;\nattribute float aRadius;\nattribute float aRadA;\nattribute float aRadB;\nattribute vec3 aColA;\nattribute vec3 aColB;\n\nuniform mat4 uView;\nuniform mat4 uProjection;\nuniform mat4 uModel;\nuniform mat4 uRotation;\nuniform float uAtomScale;\nuniform float uRelativeAtomScale;\n\nvarying vec3 vNormal;\nvarying vec3 vPosA, vPosB;\nvarying float vRadA, vRadB;\nvarying vec3 vColA, vColB;\nvarying float vRadius;\n\nmat3 alignVector(vec3 a, vec3 b) {\n    vec3 v = cross(a, b);\n    float s = length(v);\n    float c = dot(a, b);\n    mat3 I = mat3(\n        1, 0, 0,\n        0, 1, 0,\n        0, 0, 1\n    );\n    mat3 vx = mat3(\n        0, v.z, -v.y,\n        -v.z, 0, v.x,\n        v.y, -v.x, 0\n    );\n    return I + vx + vx * vx * ((1.0 - c) / (s * s));\n}\n\nvoid main() {\n    vRadius = aRadius;\n    vec3 pos = vec3(aImposter);\n    // Scale the box in x and z to be bond-radius.\n    pos = pos * vec3(vRadius, 1, vRadius);\n    // Shift the origin-centered cube so that the bottom is at the origin.\n    pos = pos + vec3(0, 1, 0);\n    // Stretch the box in y so that it is the length of the bond.\n    pos = pos * vec3(1, length(aPosA - aPosB) * 0.5, 1);\n    // Find the rotation that aligns vec3(0, 1, 0) with vec3(uPosB - uPosA) and apply it.\n    vec3 a = normalize(vec3(-0.000001, 1.000001, 0.000001));\n    vec3 b = normalize(aPosB - aPosA);\n    mat3 R = alignVector(a, b);\n    pos = R * pos;\n    // Shift the cube so that the bottom is centered at the middle of atom A.\n    pos = pos + aPosA;\n\n    vec4 position = uModel * vec4(pos, 1);\n    gl_Position = uProjection * uView * position;\n    vPosA = aPosA;\n    vPosB = aPosB;\n    vRadA = uAtomScale * (1.0 + (aRadA - 1.0) * uRelativeAtomScale);\n    vRadB = uAtomScale * (1.0 + (aRadB - 1.0) * uRelativeAtomScale);\n    vColA = aColA;\n    vColB = aColB;\n}\n\n\n// __split__\n\n\n#version 100\n#extension GL_EXT_frag_depth: enable\nprecision highp float;\n\nuniform mat4 uRotation;\nuniform vec2 uBottomLeft;\nuniform vec2 uTopRight;\nuniform float uDepth;\nuniform float uRes;\nuniform float uBondShade;\nuniform int uMode;\n\nvarying vec3 vPosA, vPosB;\nvarying float vRadA, vRadB;\nvarying vec3 vColA, vColB;\nvarying float vRadius;\n\nmat3 alignVector(vec3 a, vec3 b) {\n    vec3 v = cross(a, b);\n    float s = length(v);\n    float c = dot(a, b);\n    mat3 I = mat3(\n        1, 0, 0,\n        0, 1, 0,\n        0, 0, 1\n    );\n    mat3 vx = mat3(\n        0, v.z, -v.y,\n        -v.z, 0, v.x,\n        v.y, -v.x, 0\n    );\n    return I + vx + vx * vx * ((1.0 - c) / (s * s));\n}\n\nvoid main() {\n\n    vec2 res = vec2(uRes, uRes);\n    vec3 r0 = vec3(uBottomLeft + (gl_FragCoord.xy/res) * (uTopRight - uBottomLeft), uDepth/2.0);\n    vec3 rd = vec3(0, 0, -1);\n\n    vec3 i = normalize(vPosB - vPosA);\n         i = vec3(uRotation * vec4(i, 0));\n    vec3 j = normalize(vec3(-0.000001, 1.000001, 0.000001));\n    mat3 R = alignVector(i, j);\n\n    vec3 r0p = r0 - vec3(uRotation * vec4(vPosA, 0));\n    r0p = R * r0p;\n    vec3 rdp = R * rd;\n\n    float a = dot(rdp.xz, rdp.xz);\n    float b = 2.0 * dot(rdp.xz, r0p.xz);\n    float c = dot(r0p.xz, r0p.xz) - vRadius*vRadius;\n    float disc = b*b - 4.0*a*c;\n    if (disc <= 0.0) {\n        discard;\n    }\n    float t = (-b - sqrt(disc))/(2.0*a);\n    if (t < 0.0) {\n        discard;\n    }\n\n    vec3 coord = r0p + rdp * t;\n    if (coord.y < 0.0 || coord.y > length(vPosA - vPosB)) {\n        discard;\n    }\n\n    vec3 color;\n    if (coord.y < vRadA + 0.5 * (length(vPosA - vPosB) - (vRadA + vRadB))) {\n        color = vColA;\n    } else {\n        color = vColB;\n    }\n\n    color = mix(color, vec3(1,1,1), uBondShade);\n\n    R = alignVector(j, i);\n    vec3 normal = normalize(R * vec3(coord.x, 0, coord.z));\n\n    coord = r0 + rd * t;\n    if (uMode == 0) {\n        gl_FragColor = vec4(color, 1);\n    } else if (uMode == 1) {\n        gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);\n    }\n    gl_FragDepthEXT = -(coord.z - uDepth/2.0)/uDepth;\n}\n";

	var texturedquad = "#version 100\nprecision highp float;\n\nattribute vec3 aPosition;\n\nvoid main() {\n    gl_Position = vec4(aPosition, 1);\n}\n\n\n// __split__\n\n\n#version 100\nprecision highp float;\n\nuniform sampler2D uTexture;\nuniform float uRes;\n\nvoid main() {\n    gl_FragColor = texture2D(uTexture, gl_FragCoord.xy/uRes);\n}\n";

	var accumulator = "#version 100\nprecision highp float;\n\nattribute vec3 aPosition;\n\nvoid main() {\n    gl_Position = vec4(aPosition, 1);\n}\n\n\n// __split__\n\n\n#version 100\nprecision highp float;\n\nuniform sampler2D uSceneDepth;\nuniform sampler2D uSceneNormal;\nuniform sampler2D uRandRotDepth;\nuniform sampler2D uAccumulator;\nuniform mat4 uRot;\nuniform mat4 uInvRot;\nuniform vec2 uSceneBottomLeft;\nuniform vec2 uSceneTopRight;\nuniform vec2 uRotBottomLeft;\nuniform vec2 uRotTopRight;\nuniform float uDepth;\nuniform float uRes;\nuniform int uSampleCount;\n\nvoid main() {\n\n    float dScene = texture2D(uSceneDepth, gl_FragCoord.xy/uRes).r;\n\n    vec3 r = vec3(uSceneBottomLeft + (gl_FragCoord.xy/uRes) * (uSceneTopRight - uSceneBottomLeft), 0.0);\n\n    r.z = -(dScene - 0.5) * uDepth;\n    r = vec3(uRot * vec4(r, 1));\n    float depth = -r.z/uDepth + 0.5;\n\n    vec2 p = (r.xy - uRotBottomLeft)/(uRotTopRight - uRotBottomLeft);\n\n    float dRandRot = texture2D(uRandRotDepth, p).r;\n\n    float ao = step(dRandRot, depth * 0.99);\n\n    vec3 normal = texture2D(uSceneNormal, gl_FragCoord.xy/uRes).rgb * 2.0 - 1.0;\n    vec3 dir = vec3(uInvRot * vec4(0, 0, 1, 0));\n    float mag = dot(dir, normal);\n    float sampled = step(0.0, mag);\n\n    ao *= sampled;\n\n    vec4 acc = texture2D(uAccumulator, gl_FragCoord.xy/uRes);\n\n    if (uSampleCount < 256) {\n        acc.r += ao/255.0;\n    } else if (uSampleCount < 512) {\n        acc.g += ao/255.0;\n    } else if (uSampleCount < 768) {\n        acc.b += ao/255.0;\n    } else {\n        acc.a += ao/255.0;\n    }\n        \n    gl_FragColor = acc;\n\n}\n";

	var ao = "#version 100\nprecision highp float;\n\nattribute vec3 aPosition;\n\nvoid main() {\n    gl_Position = vec4(aPosition, 1);\n}\n\n\n// __split__\n\n\n#version 100\nprecision highp float;\n\nuniform sampler2D uSceneColor;\nuniform sampler2D uSceneDepth;\nuniform sampler2D uAccumulatorOut;\nuniform float uRes;\nuniform float uAO;\nuniform float uBrightness;\nuniform float uOutlineStrength;\n\nvoid main() {\n    vec2 p = gl_FragCoord.xy/uRes;\n    vec4 sceneColor = texture2D(uSceneColor, p);\n    if (uOutlineStrength > 0.0) {\n        float depth = texture2D(uSceneDepth, p).r;\n        float r = 1.0/511.0;\n        float d0 = abs(texture2D(uSceneDepth, p + vec2(-r,  0)).r - depth);\n        float d1 = abs(texture2D(uSceneDepth, p + vec2( r,  0)).r - depth);\n        float d2 = abs(texture2D(uSceneDepth, p + vec2( 0, -r)).r - depth);\n        float d3 = abs(texture2D(uSceneDepth, p + vec2( 0,  r)).r - depth);\n        float d = max(d0, d1);\n        d = max(d, d2);\n        d = max(d, d3);\n        sceneColor.rgb *= pow(1.0 - d, uOutlineStrength * 32.0);\n        sceneColor.a = max(step(0.003, d), sceneColor.a);\n    }\n    vec4 dAccum = texture2D(uAccumulatorOut, p);\n    float shade = max(0.0, 1.0 - (dAccum.r + dAccum.g + dAccum.b + dAccum.a) * 0.25 * uAO);\n    shade = pow(shade, 2.0);\n    gl_FragColor = vec4(uBrightness * sceneColor.rgb * shade, sceneColor.a);\n}\n";

	var fxaa = "#version 100\nprecision highp float;\n\nattribute vec3 aPosition;\n\nvoid main() {\n    gl_Position = vec4(aPosition, 1);\n}\n\n\n// __split__\n\n\n#version 100\nprecision highp float;\n\nuniform sampler2D uTexture;\nuniform float uRes;\n\nvoid main() {\n    float FXAA_SPAN_MAX = 8.0;\n    float FXAA_REDUCE_MUL = 1.0/8.0;\n    float FXAA_REDUCE_MIN = 1.0/128.0;\n\n    vec2 texCoords = gl_FragCoord.xy/uRes;\n\n    vec4 rgbNW = texture2D(uTexture, texCoords + (vec2(-1.0, -1.0) / uRes));\n    vec4 rgbNE = texture2D(uTexture, texCoords + (vec2(1.0, -1.0) / uRes));\n    vec4 rgbSW = texture2D(uTexture, texCoords + (vec2(-1.0, 1.0) / uRes));\n    vec4 rgbSE = texture2D(uTexture, texCoords + (vec2(1.0, 1.0) / uRes));\n    vec4 rgbM  = texture2D(uTexture, texCoords);\n\n    vec4 luma = vec4(0.299, 0.587, 0.114, 1.0);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot(rgbM,  luma);\n\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\n    vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\n    float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);\n\n    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) / uRes;\n\n    vec4 rgbA = (1.0/2.0) * \n        (texture2D(uTexture, texCoords.xy + dir * (1.0/3.0 - 0.5)) + \n         texture2D(uTexture, texCoords.xy + dir * (2.0/3.0 - 0.5)));\n    vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * \n        (texture2D(uTexture, texCoords.xy + dir * (0.0/3.0 - 0.5)) +\n         texture2D(uTexture, texCoords.xy + dir * (3.0/3.0 - 0.5)));\n    float lumaB = dot(rgbB, luma);\n\n    if((lumaB < lumaMin) || (lumaB > lumaMax)){\n        gl_FragColor = rgbA;\n    } else {\n        gl_FragColor = rgbB;\n    }\n\n}";

	var dof = "#version 100\nprecision highp float;\n\nattribute vec3 aPosition;\n\nvoid main() {\n    gl_Position = vec4(aPosition, 1);\n}\n\n\n// __split__\n\n\n#version 100\nprecision highp float;\n\nuniform sampler2D uColor;\nuniform sampler2D uDepth;\nuniform float uRes;\nuniform float uDOFPosition;\nuniform float uDOFStrength;\nuniform int leftRight;\n\nvoid main() {\n\n    vec2 samples[64];\n    samples[0] = vec2(0.857612, 0.019885);\n    samples[1] = vec2(0.563809, -0.028071);\n    samples[2] = vec2(0.825599, -0.346856);\n    samples[3] = vec2(0.126584, -0.380959);\n    samples[4] = vec2(0.782948, 0.594322);\n    samples[5] = vec2(0.292148, -0.543265);\n    samples[6] = vec2(0.130700, 0.330220);\n    samples[7] = vec2(0.236088, 0.159604);\n    samples[8] = vec2(-0.305259, 0.810505);\n    samples[9] = vec2(0.269616, 0.923026);\n    samples[10] = vec2(0.484486, 0.371845);\n    samples[11] = vec2(-0.638057, 0.080447);\n    samples[12] = vec2(0.199629, 0.667280);\n    samples[13] = vec2(-0.861043, -0.370583);\n    samples[14] = vec2(-0.040652, -0.996174);\n    samples[15] = vec2(0.330458, -0.282111);\n    samples[16] = vec2(0.647795, -0.214354);\n    samples[17] = vec2(0.030422, -0.189908);\n    samples[18] = vec2(0.177430, -0.721124);\n    samples[19] = vec2(-0.461163, -0.327434);\n    samples[20] = vec2(-0.410012, -0.734504);\n    samples[21] = vec2(-0.616334, -0.626069);\n    samples[22] = vec2(0.590759, -0.726479);\n    samples[23] = vec2(-0.590794, 0.805365);\n    samples[24] = vec2(-0.924561, -0.163739);\n    samples[25] = vec2(-0.323028, 0.526960);\n    samples[26] = vec2(0.642128, 0.752577);\n    samples[27] = vec2(0.173625, -0.952386);\n    samples[28] = vec2(0.759014, 0.330311);\n    samples[29] = vec2(-0.360526, -0.032013);\n    samples[30] = vec2(-0.035320, 0.968156);\n    samples[31] = vec2(0.585478, -0.431068);\n    samples[32] = vec2(-0.244766, -0.906947);\n    samples[33] = vec2(-0.853096, 0.184615);\n    samples[34] = vec2(-0.089061, 0.104648);\n    samples[35] = vec2(-0.437613, 0.285308);\n    samples[36] = vec2(-0.654098, 0.379841);\n    samples[37] = vec2(-0.128663, 0.456572);\n    samples[38] = vec2(0.015980, -0.568170);\n    samples[39] = vec2(-0.043966, -0.771940);\n    samples[40] = vec2(0.346512, -0.071238);\n    samples[41] = vec2(-0.207921, -0.209121);\n    samples[42] = vec2(-0.624075, -0.189224);\n    samples[43] = vec2(-0.120618, 0.689339);\n    samples[44] = vec2(-0.664679, -0.410200);\n    samples[45] = vec2(0.371945, -0.880573);\n    samples[46] = vec2(-0.743251, 0.629998);\n    samples[47] = vec2(-0.191926, -0.413946);\n    samples[48] = vec2(0.449574, 0.833373);\n    samples[49] = vec2(0.299587, 0.449113);\n    samples[50] = vec2(-0.900432, 0.399319);\n    samples[51] = vec2(0.762613, -0.544796);\n    samples[52] = vec2(0.606462, 0.174233);\n    samples[53] = vec2(0.962185, -0.167019);\n    samples[54] = vec2(0.960990, 0.249552);\n    samples[55] = vec2(0.570397, 0.559146);\n    samples[56] = vec2(-0.537514, 0.555019);\n    samples[57] = vec2(0.108491, -0.003232);\n    samples[58] = vec2(-0.237693, -0.615428);\n    samples[59] = vec2(-0.217313, 0.261084);\n    samples[60] = vec2(-0.998966, 0.025692);\n    samples[61] = vec2(-0.418554, -0.527508);\n    samples[62] = vec2(-0.822629, -0.567797);\n    samples[63] = vec2(0.061945, 0.522105);\n\n    float invRes = 1.0/uRes;\n    vec2 coord = gl_FragCoord.xy * invRes;\n\n    float strength = uDOFStrength * uRes/768.0;\n\n    float depth = texture2D(uDepth, coord).r;\n    float range = uDOFPosition - depth;\n    float scale = abs(range);\n\n    vec4 sample = texture2D(uColor, coord);\n    float count = 1.0;\n    for(int i = 0; i < 64; i++) {\n        vec2 p = samples[i];\n        p = coord + scale * 64.0 * strength * p * invRes;\n        float d = texture2D(uDepth, p).r;\n        float r = uDOFPosition - d;\n        float s = abs(r);\n        sample += texture2D(uColor, p) * s;\n        count += s;\n    }\n\n    gl_FragColor = sample/count;\n}";

	var ShaderChunk = {
	    atoms: atoms,
	    bonds, bonds,
	    texturedquad: texturedquad,
	    accumulator: accumulator,
	    ao: ao,
	    fxaa: fxaa,
	    dof: dof
	};

	var n = -1;
	var p = 1;

	var position = [
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

	var elements = {
	    'Xx': {'symbol':  'Xx', 'name':       'unknown', 'mass':   1.00000000, 'radius':  1.0000, 'color': [1.000, 0.078, 0.576], 'number': 0},
	    'H': {'symbol':   'H', 'name':      'hydrogen', 'mass':   1.00794000, 'radius':  0.3100, 'color': [1.000, 1.000, 1.000], 'number': 1},
	    'He': {'symbol':  'He', 'name':        'helium', 'mass':   4.00260200, 'radius':  0.2800, 'color': [0.851, 1.000, 1.000], 'number': 2},
	    'Li': {'symbol':  'Li', 'name':       'lithium', 'mass':   6.94100000, 'radius':  1.2800, 'color': [0.800, 0.502, 1.000], 'number': 3},
	    'Be': {'symbol':  'Be', 'name':     'beryllium', 'mass':   9.01218200, 'radius':  0.9600, 'color': [0.761, 1.000, 0.000], 'number': 4},
	    'B': {'symbol':   'B', 'name':         'boron', 'mass':  10.81100000, 'radius':  0.8400, 'color': [1.000, 0.710, 0.710], 'number': 5},
	    'C': {'symbol':   'C', 'name':        'carbon', 'mass':  12.01070000, 'radius':  0.7300, 'color': [0.565, 0.565, 0.565], 'number': 6},
	    'N': {'symbol':   'N', 'name':      'nitrogen', 'mass':  14.00670000, 'radius':  0.7100, 'color': [0.188, 0.314, 0.973], 'number': 7},
	    'O': {'symbol':   'O', 'name':        'oxygen', 'mass':  15.99940000, 'radius':  0.6600, 'color': [1.000, 0.051, 0.051], 'number': 8},
	    'F': {'symbol':   'F', 'name':      'fluorine', 'mass':  18.99840320, 'radius':  0.5700, 'color': [0.565, 0.878, 0.314], 'number': 9},
	    'Ne': {'symbol':  'Ne', 'name':          'neon', 'mass':  20.17970000, 'radius':  0.5800, 'color': [0.702, 0.890, 0.961], 'number': 10},
	    'Na': {'symbol':  'Na', 'name':        'sodium', 'mass':  22.98976928, 'radius':  1.6600, 'color': [0.671, 0.361, 0.949], 'number': 11},
	    'Mg': {'symbol':  'Mg', 'name':     'magnesium', 'mass':  24.30500000, 'radius':  1.4100, 'color': [0.541, 1.000, 0.000], 'number': 12},
	    'Al': {'symbol':  'Al', 'name':      'aluminum', 'mass':  26.98153860, 'radius':  1.2100, 'color': [0.749, 0.651, 0.651], 'number': 13},
	    'Si': {'symbol':  'Si', 'name':       'silicon', 'mass':  28.08550000, 'radius':  1.1100, 'color': [0.941, 0.784, 0.627], 'number': 14},
	    'P': {'symbol':   'P', 'name':    'phosphorus', 'mass':  30.97376200, 'radius':  1.0700, 'color': [1.000, 0.502, 0.000], 'number': 15},
	    'S': {'symbol':   'S', 'name':        'sulfur', 'mass':  32.06500000, 'radius':  1.0500, 'color': [1.000, 1.000, 0.188], 'number': 16},
	    'Cl': {'symbol':  'Cl', 'name':      'chlorine', 'mass':  35.45300000, 'radius':  1.0200, 'color': [0.122, 0.941, 0.122], 'number': 17},
	    'Ar': {'symbol':  'Ar', 'name':         'argon', 'mass':  39.94800000, 'radius':  1.0600, 'color': [0.502, 0.820, 0.890], 'number': 18},
	    'K': {'symbol':   'K', 'name':     'potassium', 'mass':  39.09830000, 'radius':  2.0300, 'color': [0.561, 0.251, 0.831], 'number': 19},
	    'Ca': {'symbol':  'Ca', 'name':       'calcium', 'mass':  40.07800000, 'radius':  1.7600, 'color': [0.239, 1.000, 0.000], 'number': 20},
	    'Sc': {'symbol':  'Sc', 'name':      'scandium', 'mass':  44.95591200, 'radius':  1.7000, 'color': [0.902, 0.902, 0.902], 'number': 21},
	    'Ti': {'symbol':  'Ti', 'name':      'titanium', 'mass':  47.86700000, 'radius':  1.6000, 'color': [0.749, 0.761, 0.780], 'number': 22},
	    'V': {'symbol':   'V', 'name':      'vanadium', 'mass':  50.94150000, 'radius':  1.5300, 'color': [0.651, 0.651, 0.671], 'number': 23},
	    'Cr': {'symbol':  'Cr', 'name':      'chromium', 'mass':  51.99610000, 'radius':  1.3900, 'color': [0.541, 0.600, 0.780], 'number': 24},
	    'Mn': {'symbol':  'Mn', 'name':     'manganese', 'mass':  54.93804500, 'radius':  1.3900, 'color': [0.611, 0.478, 0.780], 'number': 25},
	    'Fe': {'symbol':  'Fe', 'name':          'iron', 'mass':  55.84500000, 'radius':  1.3200, 'color': [0.878, 0.400, 0.200], 'number': 26},
	    'Co': {'symbol':  'Co', 'name':        'cobalt', 'mass':  58.69340000, 'radius':  1.2600, 'color': [0.941, 0.565, 0.627], 'number': 27},
	    'Ni': {'symbol':  'Ni', 'name':        'nickel', 'mass':  58.93319500, 'radius':  1.2400, 'color': [0.314, 0.816, 0.314], 'number': 28},
	    'Cu': {'symbol':  'Cu', 'name':        'copper', 'mass':  63.54600000, 'radius':  1.3200, 'color': [0.784, 0.502, 0.200], 'number': 29},
	    'Zn': {'symbol':  'Zn', 'name':          'zinc', 'mass':  65.38000000, 'radius':  1.2200, 'color': [0.490, 0.502, 0.690], 'number': 30},
	    'Ga': {'symbol':  'Ga', 'name':       'gallium', 'mass':  69.72300000, 'radius':  1.2200, 'color': [0.761, 0.561, 0.561], 'number': 31},
	    'Ge': {'symbol':  'Ge', 'name':     'germanium', 'mass':  72.64000000, 'radius':  1.2000, 'color': [0.400, 0.561, 0.561], 'number': 32},
	    'As': {'symbol':  'As', 'name':       'arsenic', 'mass':  74.92160000, 'radius':  1.1900, 'color': [0.741, 0.502, 0.890], 'number': 33},
	    'Se': {'symbol':  'Se', 'name':      'selenium', 'mass':  78.96000000, 'radius':  1.2000, 'color': [1.000, 0.631, 0.000], 'number': 34},
	    'Br': {'symbol':  'Br', 'name':       'bromine', 'mass':  79.90400000, 'radius':  1.2000, 'color': [0.651, 0.161, 0.161], 'number': 35},
	    'Kr': {'symbol':  'Kr', 'name':       'krypton', 'mass':  83.79800000, 'radius':  1.1600, 'color': [0.361, 0.722, 0.820], 'number': 36},
	    'Rb': {'symbol':  'Rb', 'name':      'rubidium', 'mass':  85.46780000, 'radius':  2.2000, 'color': [0.439, 0.180, 0.690], 'number': 37},
	    'Sr': {'symbol':  'Sr', 'name':     'strontium', 'mass':  87.62000000, 'radius':  1.9500, 'color': [0.000, 1.000, 0.000], 'number': 38},
	    'Y': {'symbol':   'Y', 'name':       'yttrium', 'mass':  88.90585000, 'radius':  1.9000, 'color': [0.580, 1.000, 1.000], 'number': 39},
	    'Zr': {'symbol':  'Zr', 'name':     'zirconium', 'mass':  91.22400000, 'radius':  1.7500, 'color': [0.580, 0.878, 0.878], 'number': 40},
	    'Nb': {'symbol':  'Nb', 'name':       'niobium', 'mass':  92.90638000, 'radius':  1.6400, 'color': [0.451, 0.761, 0.788], 'number': 41},
	    'Mo': {'symbol':  'Mo', 'name':    'molybdenum', 'mass':  95.96000000, 'radius':  1.5400, 'color': [0.329, 0.710, 0.710], 'number': 42},
	    'Tc': {'symbol':  'Tc', 'name':    'technetium', 'mass':  98.00000000, 'radius':  1.4700, 'color': [0.231, 0.620, 0.620], 'number': 43},
	    'Ru': {'symbol':  'Ru', 'name':     'ruthenium', 'mass': 101.07000000, 'radius':  1.4600, 'color': [0.141, 0.561, 0.561], 'number': 44},
	    'Rh': {'symbol':  'Rh', 'name':       'rhodium', 'mass': 102.90550000, 'radius':  1.4200, 'color': [0.039, 0.490, 0.549], 'number': 45},
	    'Pd': {'symbol':  'Pd', 'name':     'palladium', 'mass': 106.42000000, 'radius':  1.3900, 'color': [0.000, 0.412, 0.522], 'number': 46},
	    'Ag': {'symbol':  'Ag', 'name':        'silver', 'mass': 107.86820000, 'radius':  1.4500, 'color': [0.753, 0.753, 0.753], 'number': 47},
	    'Cd': {'symbol':  'Cd', 'name':       'cadmium', 'mass': 112.41100000, 'radius':  1.4400, 'color': [1.000, 0.851, 0.561], 'number': 48},
	    'In': {'symbol':  'In', 'name':        'indium', 'mass': 114.81800000, 'radius':  1.4200, 'color': [0.651, 0.459, 0.451], 'number': 49},
	    'Sn': {'symbol':  'Sn', 'name':           'tin', 'mass': 118.71000000, 'radius':  1.3900, 'color': [0.400, 0.502, 0.502], 'number': 50},
	    'Sb': {'symbol':  'Sb', 'name':      'antimony', 'mass': 121.76000000, 'radius':  1.3900, 'color': [0.620, 0.388, 0.710], 'number': 51},
	    'Te': {'symbol':  'Te', 'name':     'tellurium', 'mass': 127.60000000, 'radius':  1.3800, 'color': [0.831, 0.478, 0.000], 'number': 52},
	    'I': {'symbol':   'I', 'name':        'iodine', 'mass': 126.90470000, 'radius':  1.3900, 'color': [0.580, 0.000, 0.580], 'number': 53},
	    'Xe': {'symbol':  'Xe', 'name':         'xenon', 'mass': 131.29300000, 'radius':  1.4000, 'color': [0.259, 0.620, 0.690], 'number': 54},
	    'Cs': {'symbol':  'Cs', 'name':        'cesium', 'mass': 132.90545190, 'radius':  2.4400, 'color': [0.341, 0.090, 0.561], 'number': 55},
	    'Ba': {'symbol':  'Ba', 'name':        'barium', 'mass': 137.32700000, 'radius':  2.1500, 'color': [0.000, 0.788, 0.000], 'number': 56},
	    'La': {'symbol':  'La', 'name':     'lanthanum', 'mass': 138.90547000, 'radius':  2.0700, 'color': [0.439, 0.831, 1.000], 'number': 57},
	    'Ce': {'symbol':  'Ce', 'name':        'cerium', 'mass': 140.11600000, 'radius':  2.0400, 'color': [1.000, 1.000, 0.780], 'number': 58},
	    'Pr': {'symbol':  'Pr', 'name':  'praseodymium', 'mass': 140.90765000, 'radius':  2.0300, 'color': [0.851, 1.000, 0.780], 'number': 59},
	    'Nd': {'symbol':  'Nd', 'name':     'neodymium', 'mass': 144.24200000, 'radius':  2.0100, 'color': [0.780, 1.000, 0.780], 'number': 60},
	    'Pm': {'symbol':  'Pm', 'name':    'promethium', 'mass': 145.00000000, 'radius':  1.9900, 'color': [0.639, 1.000, 0.780], 'number': 61},
	    'Sm': {'symbol':  'Sm', 'name':      'samarium', 'mass': 150.36000000, 'radius':  1.9800, 'color': [0.561, 1.000, 0.780], 'number': 62},
	    'Eu': {'symbol':  'Eu', 'name':      'europium', 'mass': 151.96400000, 'radius':  1.9800, 'color': [0.380, 1.000, 0.780], 'number': 63},
	    'Gd': {'symbol':  'Gd', 'name':    'gadolinium', 'mass': 157.25000000, 'radius':  1.9600, 'color': [0.271, 1.000, 0.780], 'number': 64},
	    'Tb': {'symbol':  'Tb', 'name':       'terbium', 'mass': 158.92535000, 'radius':  1.9400, 'color': [0.189, 1.000, 0.780], 'number': 65},
	    'Dy': {'symbol':  'Dy', 'name':    'dysprosium', 'mass': 162.50000000, 'radius':  1.9200, 'color': [0.122, 1.000, 0.780], 'number': 66},
	    'Ho': {'symbol':  'Ho', 'name':       'holmium', 'mass': 164.93032000, 'radius':  1.9200, 'color': [0.000, 1.000, 0.612], 'number': 67},
	    'Er': {'symbol':  'Er', 'name':        'erbium', 'mass': 167.25900000, 'radius':  1.8900, 'color': [0.000, 0.902, 0.459], 'number': 68},
	    'Tm': {'symbol':  'Tm', 'name':       'thulium', 'mass': 168.93421000, 'radius':  1.9000, 'color': [0.000, 0.831, 0.322], 'number': 69},
	    'Yb': {'symbol':  'Yb', 'name':     'ytterbium', 'mass': 173.05400000, 'radius':  1.8700, 'color': [0.000, 0.749, 0.220], 'number': 70},
	    'Lu': {'symbol':  'Lu', 'name':      'lutetium', 'mass': 174.96680000, 'radius':  1.8700, 'color': [0.000, 0.671, 0.141], 'number': 71},
	    'Hf': {'symbol':  'Hf', 'name':       'hafnium', 'mass': 178.49000000, 'radius':  1.7500, 'color': [0.302, 0.761, 1.000], 'number': 72},
	    'Ta': {'symbol':  'Ta', 'name':      'tantalum', 'mass': 180.94788000, 'radius':  1.7000, 'color': [0.302, 0.651, 1.000], 'number': 73},
	    'W': {'symbol':   'W', 'name':      'tungsten', 'mass': 183.84000000, 'radius':  1.6200, 'color': [0.129, 0.580, 0.839], 'number': 74},
	    'Re': {'symbol':  'Re', 'name':       'rhenium', 'mass': 186.20700000, 'radius':  1.5100, 'color': [0.149, 0.490, 0.671], 'number': 75},
	    'Os': {'symbol':  'Os', 'name':        'osmium', 'mass': 190.23000000, 'radius':  1.4400, 'color': [0.149, 0.400, 0.588], 'number': 76},
	    'Ir': {'symbol':  'Ir', 'name':       'iridium', 'mass': 192.21700000, 'radius':  1.4100, 'color': [0.090, 0.329, 0.529], 'number': 77},
	    'Pt': {'symbol':  'Pt', 'name':      'platinum', 'mass': 195.08400000, 'radius':  1.3600, 'color': [0.816, 0.816, 0.878], 'number': 78},
	    'Au': {'symbol':  'Au', 'name':          'gold', 'mass': 196.96656900, 'radius':  1.3600, 'color': [1.000, 0.820, 0.137], 'number': 79},
	    'Hg': {'symbol':  'Hg', 'name':       'mercury', 'mass': 200.59000000, 'radius':  1.3200, 'color': [0.722, 0.722, 0.816], 'number': 80},
	    'Tl': {'symbol':  'Tl', 'name':      'thallium', 'mass': 204.38330000, 'radius':  1.4500, 'color': [0.651, 0.329, 0.302], 'number': 81},
	    'Pb': {'symbol':  'Pb', 'name':          'lead', 'mass': 207.20000000, 'radius':  1.4600, 'color': [0.341, 0.349, 0.380], 'number': 82},
	    'Bi': {'symbol':  'Bi', 'name':       'bismuth', 'mass': 208.98040000, 'radius':  1.4800, 'color': [0.620, 0.310, 0.710], 'number': 83},
	    'Po': {'symbol':  'Po', 'name':      'polonium', 'mass': 210.00000000, 'radius':  1.4000, 'color': [0.671, 0.361, 0.000], 'number': 84},
	    'At': {'symbol':  'At', 'name':      'astatine', 'mass': 210.00000000, 'radius':  1.5000, 'color': [0.459, 0.310, 0.271], 'number': 85},
	    'Rn': {'symbol':  'Rn', 'name':         'radon', 'mass': 220.00000000, 'radius':  1.5000, 'color': [0.259, 0.510, 0.588], 'number': 86},
	    'Fr': {'symbol':  'Fr', 'name':      'francium', 'mass': 223.00000000, 'radius':  2.6000, 'color': [0.259, 0.000, 0.400], 'number': 87},
	    'Ra': {'symbol':  'Ra', 'name':        'radium', 'mass': 226.00000000, 'radius':  2.2100, 'color': [0.000, 0.490, 0.000], 'number': 88},
	    'Ac': {'symbol':  'Ac', 'name':      'actinium', 'mass': 227.00000000, 'radius':  2.1500, 'color': [0.439, 0.671, 0.980], 'number': 89},
	    'Th': {'symbol':  'Th', 'name':       'thorium', 'mass': 231.03588000, 'radius':  2.0600, 'color': [0.000, 0.729, 1.000], 'number': 90},
	    'Pa': {'symbol':  'Pa', 'name':  'protactinium', 'mass': 232.03806000, 'radius':  2.0000, 'color': [0.000, 0.631, 1.000], 'number': 91},
	    'U': {'symbol':   'U', 'name':       'uranium', 'mass': 237.00000000, 'radius':  1.9600, 'color': [0.000, 0.561, 1.000], 'number': 92},
	    'Np': {'symbol':  'Np', 'name':     'neptunium', 'mass': 238.02891000, 'radius':  1.9000, 'color': [0.000, 0.502, 1.000], 'number': 93},
	    'Pu': {'symbol':  'Pu', 'name':     'plutonium', 'mass': 243.00000000, 'radius':  1.8700, 'color': [0.000, 0.420, 1.000], 'number': 94},
	    'Am': {'symbol':  'Am', 'name':     'americium', 'mass': 244.00000000, 'radius':  1.8000, 'color': [0.329, 0.361, 0.949], 'number': 95},
	    'Cm': {'symbol':  'Cm', 'name':        'curium', 'mass': 247.00000000, 'radius':  1.6900, 'color': [0.471, 0.361, 0.890], 'number': 96},
	    'Bk': {'symbol':  'Bk', 'name':     'berkelium', 'mass': 247.00000000, 'radius':  1.6600, 'color': [0.541, 0.310, 0.890], 'number': 97},
	    'Cf': {'symbol':  'Cf', 'name':   'californium', 'mass': 251.00000000, 'radius':  1.6800, 'color': [0.631, 0.212, 0.831], 'number': 98},
	    'Es': {'symbol':  'Es', 'name':   'einsteinium', 'mass': 252.00000000, 'radius':  1.6500, 'color': [0.702, 0.122, 0.831], 'number': 99},
	    'Fm': {'symbol':  'Fm', 'name':       'fermium', 'mass': 257.00000000, 'radius':  1.6700, 'color': [0.702, 0.122, 0.729], 'number': 100},
	    'Md': {'symbol':  'Md', 'name':   'mendelevium', 'mass': 258.00000000, 'radius':  1.7300, 'color': [0.702, 0.051, 0.651], 'number': 101},
	    'No': {'symbol':  'No', 'name':      'nobelium', 'mass': 259.00000000, 'radius':  1.7600, 'color': [0.741, 0.051, 0.529], 'number': 102},
	    'Lr': {'symbol':  'Lr', 'name':    'lawrencium', 'mass': 262.00000000, 'radius':  1.6100, 'color': [0.780, 0.000, 0.400], 'number': 103},
	    'Rf': {'symbol':  'Rf', 'name': 'rutherfordium', 'mass': 261.00000000, 'radius':  1.5700, 'color': [0.800, 0.000, 0.349], 'number': 104},
	    'Db': {'symbol':  'Db', 'name':       'dubnium', 'mass': 262.00000000, 'radius':  1.4900, 'color': [0.820, 0.000, 0.310], 'number': 105},
	    'Sg': {'symbol':  'Sg', 'name':    'seaborgium', 'mass': 266.00000000, 'radius':  1.4300, 'color': [0.851, 0.000, 0.271], 'number': 106},
	    'Bh': {'symbol':  'Bh', 'name':       'bohrium', 'mass': 264.00000000, 'radius':  1.4100, 'color': [0.878, 0.000, 0.220], 'number': 107},
	    'Hs': {'symbol':  'Hs', 'name':       'hassium', 'mass': 277.00000000, 'radius':  1.3400, 'color': [0.902, 0.000, 0.180], 'number': 108},
	    'Mt': {'symbol':  'Mt', 'name':    'meitnerium', 'mass': 268.00000000, 'radius':  1.2900, 'color': [0.922, 0.000, 0.149], 'number': 109},
	    'Ds': {'symbol':  'Ds', 'name':            'Ds', 'mass': 271.00000000, 'radius':  1.2800, 'color': [0.922, 0.000, 0.149], 'number': 110},
	    'Uuu': {'symbol': 'Uuu', 'name':           'Uuu', 'mass': 272.00000000, 'radius':  1.2100, 'color': [0.922, 0.000, 0.149], 'number': 111},
	    'Uub': {'symbol': 'Uub', 'name':           'Uub', 'mass': 285.00000000, 'radius':  1.2200, 'color': [0.922, 0.000, 0.149], 'number': 112},
	    'Uut': {'symbol': 'Uut', 'name':           'Uut', 'mass': 284.00000000, 'radius':  1.3600, 'color': [0.922, 0.000, 0.149], 'number': 113},
	    'Uuq': {'symbol': 'Uuq', 'name':           'Uuq', 'mass': 289.00000000, 'radius':  1.4300, 'color': [0.922, 0.000, 0.149], 'number': 114},
	    'Uup': {'symbol': 'Uup', 'name':           'Uup', 'mass': 288.00000000, 'radius':  1.6200, 'color': [0.922, 0.000, 0.149], 'number': 115},
	    'Uuh': {'symbol': 'Uuh', 'name':           'Uuh', 'mass': 292.00000000, 'radius':  1.7500, 'color': [0.922, 0.000, 0.149], 'number': 116},
	    'Uus': {'symbol': 'Uus', 'name':           'Uus', 'mass': 294.00000000, 'radius':  1.6500, 'color': [0.922, 0.000, 0.149], 'number': 117},
	    'Uuo': {'symbol': 'Uuo', 'name':           'Uuo', 'mass': 296.00000000, 'radius':  1.5700, 'color': [0.922, 0.000, 0.149], 'number': 118}
	};

	function extend(out) {
	    out = out || {};
	    for (var i = 1; i < arguments.length; i++) {
	        if (!arguments[i])
	            continue;
	        for (var key in arguments[i]) {
	            if (arguments[i].hasOwnProperty(key))
	                out[key] = arguments[i][key];
	        }
	    }
	    return out;
	};


	function ajax_get(url, success_callback, error_callback) {
	    var request = new XMLHttpRequest();
	    request.open('GET', url, true);

	    request.onload = function() {
	        if (request.status >= 200 && request.status < 400) {
	            success_callback(request.responseText);
	        } else {
	            error_callback();
	        }
	    };

	    request.onerror = function() {
	        throw "Connection Error for ajax get request";
	    };

	    request.send();
	}

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

	function clamp(min, max, value) {
	    return Math.min(max, Math.max(min, value));
	}


	function View() {
	    return extend({
	        aspect: 1.0,
	        zoom: 0.125,
	        translation: {
	            x: 0.0,
	            y: 0.0
	        },
	        rotation: create$3(),
	        resolution: 768
	    }, config.atoms);
	};


	function center(v, system) {
	    var maxX = -Infinity;
	    var minX = Infinity;
	    var maxY = -Infinity;
	    var minY = Infinity;
	    for(var i = 0; i < system.atoms.length; i++) {
	        var a = system.atoms[i];
	        var r = elements[a.symbol].radius;
	        r = 2.5 * v.atomScale * (1 + (r - 1) * v.relativeAtomScale);
	        var p = fromValues$6(a.x, a.y, a.z, 0);
	        transformMat4$1(p, p, v.rotation);
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


	function clone$8(v) {
	    return deserialize(serialize(v));
	};


	function serialize(v) {
	    return JSON.stringify(v);
	};


	function deserialize(v) {
	    v = JSON.parse(v);
	    v.rotation = clone$3(v.rotation);
	    return v;
	};


	function resolve(v) {
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


	function translate$5(v, dx, dy) {
	    v.translation.x -= dx/(v.resolution * v.zoom);
	    v.translation.y += dy/(v.resolution * v.zoom);
	    resolve(v);
	};


	function rotate$4(v, dx, dy) {
	    var m = create$3();
	    rotateY(m, m, dx * 0.005);
	    rotateX(m, m, dy * 0.005);
	    multiply$3(v.rotation, m, v.rotation);
	    resolve(v);
	};


	function getRect(v) {
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


	function getBondRadius(v) {
	    return v.bondScale * v.atomScale *
	        (1 + (MIN_ATOM_RADIUS - 1) * v.relativeAtomScale);
	};

	function System() {
	    return {
	        atoms: [],
	        farAtom: undefined,
	        bonds: [],
	        lattice: {}
	    };
	};

	function calculateLattice(s){
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
	    var v000 = fromValues$5(0+o[0], 0+o[1], 0+o[2]);
	    var v100 = fromValues$5(l[0]+o[0], l[1]+o[1], l[2]+o[2]);
	    var v010 = fromValues$5(l[4]+o[0], l[5]+o[1], l[6]+o[2]);
	    var v001 = fromValues$5(l[8]+o[0], l[9]+o[1], l[10]+o[2]);
	    var v110 = fromValues$5(l[0]+l[4]+o[0], l[1]+l[5]+o[1], l[2]+l[6]+o[2]);
	    var v101 = fromValues$5(l[0]+l[8]+o[0], l[1]+l[9]+o[1], l[2]+l[10]+o[2]);
	    var v011 = fromValues$5(l[4]+l[8]+o[0], l[5]+l[9]+o[1], l[6]+l[10]+o[2]);
	    var v111 = fromValues$5(l[0]+l[4]+l[8]+o[0], l[1]+l[5]+l[9]+o[1], l[2]+l[6]+l[10]+o[2]);
	    add_point(v000);
	    add_point(v100); add_point(v010); add_point(v001);
	    add_point(v110); add_point(v101); add_point(v011);
	    add_point(v111);

	    add_edge(v000, v100); add_edge(v000, v010); add_edge(v000, v001);
	    add_edge(v110, v010); add_edge(v110, v100); add_edge(v110, v111);
	    add_edge(v011, v111); add_edge(v011, v001); add_edge(v011, v010);
	    add_edge(v101, v001); add_edge(v101, v111); add_edge(v101, v100);
	}

	function calculateBonds(s) {
	    var bonds = [];
	    var sorted = s.atoms.slice();
	    sorted.sort(function(a, b) {
	        return a.z - b.z;
	    });
	    for (var i = 0; i < sorted.length; i++) {
	        var a = sorted[i];
	        var j = i + 1;
	        while(j < sorted.length && sorted[j].z < sorted[i].z + 2.5 * 2 * MAX_ATOM_RADIUS) {
	            var b = sorted[j];
	            var l = fromValues$5(a.x, a.y, a.z);
	            var m = fromValues$5(b.x, b.y, b.z);
	            var d = distance(l, m);
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


	function addAtom(s, symbol, x, y, z) {
	    s.atoms.push({
	        symbol: symbol,
	        x: x,
	        y: y,
	        z: z
	    });
	};


	function getCentroid(s) {
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


	function center$1(s) {
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


	function getFarAtom(s) {
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


	function getRadius(s) {
	    var atom = getFarAtom(s);
	    var r = MAX_ATOM_RADIUS;
	    var rd = Math.sqrt(r*r + r*r + r*r) * 2.5;
	    return Math.sqrt(atom.x*atom.x + atom.y*atom.y + atom.z*atom.z) + rd;
	};

	function Renderer(canvas, resolution, aoResolution) {

	    var self = this;

	    var range,
	        samples,
	        system;

	    var gl,
	        canvas;

	    var rAtoms = null,
	        rBonds = null,
	        rDispQuad = null,
	        rAccumulator = null,
	        rAO = null,
	        rDOF = null,
	        rFXAA = null;

	    var tSceneColor, tSceneNormal, tSceneDepth,
	        tRandRotDepth, tRandRotColor,
	        tAccumulator, tAccumulatorOut,
	        tFXAA, tFXAAOut,
	        tDOF,
	        tAO;

	    var fbSceneColor, fbSceneNormal,
	        fbRandRot,
	        fbAccumulator,
	        fbFXAA,
	        fbDOF,
	        fbAO;

	    var progAtoms,
	        progBonds,
	        progAccumulator,
	        progAO,
	        progFXAA,
	        progDOF,
	        progDisplayQuad;

	    var ext;

	    var sampleCount = 0,
	        colorRendered = false,
	        normalRendered = false;

	    self.getAOProgress = function() {
	        return sampleCount/1024;
	    };

	    self.initialize = function() {

	        // Initialize canvas/gl.
	        canvas.width = canvas.height = resolution;
	        gl = canvas.getContext('webgl');
	        gl.enable(gl.DEPTH_TEST);
	        gl.enable(gl.CULL_FACE);
	        gl.clearColor(0,0,0,0);
	        gl.clearDepth(1);
	        gl.viewport(0,0,resolution,resolution);

	        window.gl = gl; //debug

	        ext = getExtensions(gl, [
	            "EXT_frag_depth",
	            "WEBGL_depth_texture",
	        ]);

	        self.createTextures();

	        // Initialize shaders.
	        progAtoms = loadProgram(gl, ShaderChunk.atoms);
	        progBonds = loadProgram(gl, ShaderChunk.bonds);
	        progDisplayQuad = loadProgram(gl, ShaderChunk.texturedquad);
	        progAccumulator = loadProgram(gl, ShaderChunk.accumulator);
	        progAO = loadProgram(gl, ShaderChunk.ao);
	        progFXAA = loadProgram(gl, ShaderChunk.fxaa);
	        progDOF = loadProgram(gl, ShaderChunk.dof);

	        var position$$ = [
	            -1, -1, 0,
	            1, -1, 0,
	            1,  1, 0,
	            -1, -1, 0,
	            1,  1, 0,
	            -1,  1, 0
	        ];

	        // Initialize geometry.
	        var attribs = buildAttribs(gl, {aPosition: 3});
	        attribs.aPosition.buffer.set(new Float32Array(position$$));
	        var count = position$$.length / 9;

	        rDispQuad = new Renderable(gl, progDisplayQuad, attribs, count);
	        rAccumulator = new Renderable(gl, progAccumulator, attribs, count);
	        rAO = new Renderable(gl, progAO, attribs, count);
	        rFXAA = new Renderable(gl, progFXAA, attribs, count);
	        rDOF = new Renderable(gl, progDOF, attribs, count);

	        samples = 0;

	    };

	    self.createTextures = function() {
	        // fbRandRot
	        tRandRotColor = new Texture(gl, 0, null, aoResolution, aoResolution);

	        tRandRotDepth = new Texture(gl, 1, null, aoResolution, aoResolution, {
	            internalFormat: gl.DEPTH_COMPONENT,
	            format: gl.DEPTH_COMPONENT,
	            type: gl.UNSIGNED_SHORT
	        });

	        fbRandRot = new Framebuffer(gl, [tRandRotColor], tRandRotDepth);

	        // fbScene
	        tSceneColor = new Texture(gl, 2, null, resolution, resolution);

	        tSceneNormal = new Texture(gl, 3, null, resolution, resolution);

	        tSceneDepth = new Texture(gl, 4, null, resolution, resolution, {
	            internalFormat: gl.DEPTH_COMPONENT,
	            format: gl.DEPTH_COMPONENT,
	            type: gl.UNSIGNED_SHORT
	        });

	        fbSceneColor = new Framebuffer(gl, [tSceneColor], tSceneDepth);

	        fbSceneNormal = new Framebuffer(gl, [tSceneNormal], tSceneDepth);

	        // fbAccumulator
	        tAccumulator = new Texture(gl, 5, null, resolution, resolution);
	        tAccumulatorOut = new Texture(gl, 6, null, resolution, resolution);
	        fbAccumulator = new Framebuffer(gl, [tAccumulatorOut]);

	        // fbAO
	        tAO = new Texture(gl, 7, null, resolution, resolution);
	        fbAO = new Framebuffer(gl, [tAO]);

	        // fbFXAA
	        tFXAA = new Texture(gl, 8, null, resolution, resolution);
	        tFXAAOut = new Texture(gl, 9, null, resolution, resolution);
	        fbFXAA = new Framebuffer(gl, [tFXAAOut]);

	        // fbDOF
	        tDOF = new Texture(gl, 10, null, resolution, resolution);
	        fbDOF = new Framebuffer(gl, [tDOF]);
	    };

	    self.setResolution = function(res, aoRes) {
	        aoResolution = aoRes;
	        resolution = res;
	        canvas.width = canvas.height = resolution;
	        gl.viewport(0,0,resolution,resolution);
	        self.createTextures();
	    };

	    self.setSystem = function(newSystem, view) {

	        system = newSystem;

	        function make36(arr) {
	            var out = [];
	            for (var i = 0; i < 36; i++) {
	                out.push.apply(out, arr);
	            }
	            return out;
	        }

	        // "Atoms" (Spheres)
	        var attribs = buildAttribs(gl, {
	            aImposter: 3, aPosition: 3, aRadius: 1, aColor: 3
	        });

	        var imposter = [];
	        var position$$ = [];
	        var radius = [];
	        var color = [];

	        for (var i = 0; i < system.atoms.length; i++) {
	            imposter.push.apply(imposter, position);
	            var a = system.atoms[i];
	            position$$.push.apply(position$$, make36([a.x, a.y, a.z]));
	            radius.push.apply(radius, make36([elements[a.symbol].radius]));
	            var c = elements[a.symbol].color;
	            color.push.apply(color, make36([c[0], c[1], c[2]]));
	        }

	        if (view.lattice && system.lattice.points) {
	            for (var i = 0; i < system.lattice.points.length; i++) {
	                imposter.push.apply(imposter, position);
	                var a = system.lattice.points[i];
	                position$$.push.apply(position$$, make36(a.position));
	                radius.push.apply(radius, make36([-4.0 * getBondRadius(view)]));
	                color.push.apply(color, make36(a.color));
	            }
	        }

	        if (imposter.length > 0) { //ensure there are atoms
	            attribs.aImposter.buffer.set(new Float32Array(imposter));
	            attribs.aPosition.buffer.set(new Float32Array(position$$));
	            attribs.aRadius.buffer.set(new Float32Array(radius));
	            attribs.aColor.buffer.set(new Float32Array(color));

	            var count = imposter.length / 9;

	            rAtoms = new Renderable(gl, progAtoms, attribs, count);
	        }

	        // "Bonds" (Cylinders)

	        if (view.bonds || view.lattice) {
	            rBonds = null;

	            var attribs = buildAttribs(gl, {
	                aImposter: 3,
	                aPosA: 3,
	                aPosB: 3,
	                aRadius: 1,
	                aRadA: 1,
	                aRadB: 1,
	                aColA: 3,
	                aColB: 3
	            });

	            var imposter = [];
	            var posa = [];
	            var posb = [];
	            var radius = [];
	            var rada = [];
	            var radb = [];
	            var cola = [];
	            var colb = [];

	            if (view.bonds && system.bonds.length > 0) {
	                for (var i = 0; i < system.bonds.length; i++) {
	                    var b = system.bonds[i];
	                    if (b.cutoff > view.bondThreshold) break;
	                    imposter.push.apply(imposter, position);
	                    posa.push.apply(posa, make36([b.posA.x, b.posA.y, b.posA.z]));
	                    posb.push.apply(posb, make36([b.posB.x, b.posB.y, b.posB.z]));
	                    radius.push.apply(radius, make36([2.5 * getBondRadius(view)]));
	                    rada.push.apply(rada, make36([b.radA]));
	                    radb.push.apply(radb, make36([b.radB]));
	                    cola.push.apply(cola, make36([b.colA.r, b.colA.g, b.colA.b]));
	                    colb.push.apply(colb, make36([b.colB.r, b.colB.g, b.colB.b]));
	                }
	            }

	            if (view.lattice && system.lattice.edges) {
	                for (var i = 0; i < system.lattice.edges.length; i++) {
	                    var b = system.lattice.edges[i];
	                    imposter.push.apply(imposter, position);
	                    posa.push.apply(posa, make36([b.posA.x, b.posA.y, b.posA.z]));
	                    posb.push.apply(posb, make36([b.posB.x, b.posB.y, b.posB.z]));
	                    radius.push.apply(radius, make36([0.5 * getBondRadius(view)]));
	                    rada.push.apply(rada, make36([b.radA]));
	                    radb.push.apply(radb, make36([b.radB]));
	                    cola.push.apply(cola, make36([b.colA.r, b.colA.g, b.colA.b]));
	                    colb.push.apply(colb, make36([b.colB.r, b.colB.g, b.colB.b]));
	                }
	            }

	            if (imposter.length > 0) { //Ensure that there are actually bonds
	                attribs.aImposter.buffer.set(new Float32Array(imposter));
	                attribs.aPosA.buffer.set(new Float32Array(posa));
	                attribs.aPosB.buffer.set(new Float32Array(posb));
	                attribs.aRadius.buffer.set(new Float32Array(radius));
	                attribs.aRadA.buffer.set(new Float32Array(rada));
	                attribs.aRadB.buffer.set(new Float32Array(radb));
	                attribs.aColA.buffer.set(new Float32Array(cola));
	                attribs.aColB.buffer.set(new Float32Array(colb));

	                var count = imposter.length / 9;

	                rBonds = new Renderable(gl, progBonds, attribs, count);
	            }
	        }
	    };

	    self.reset = function() {
	        sampleCount = 0;
	        colorRendered = false;
	        normalRendered = false;
	        tAccumulator.reset();
	        tAccumulatorOut.reset();
	    };

	    self.render = function(view) {
	        if (system === undefined) {
	            return;
	        }
	        if (rAtoms == null) {
	            return;
	        }

	        range = getRadius(system) * 2.0;

	        if (!colorRendered) {
	            color(view);
	        } else if (!normalRendered){
	            normal(view);
	        } else {
	            for (var i = 0; i < view.spf; i++) {
	                if (sampleCount > 1024) {
	                    break;
	                }
	                sample(view);
	                sampleCount++;
	            }
	        }
	        display(view);
	    };

	    function color(view) {
	        colorRendered = true;
	        gl.viewport(0, 0, resolution, resolution);
	        fbSceneColor.bind();
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        var rect = getRect(view);
	        var projection = create$3();
	        ortho(projection, rect.left, rect.right, rect.bottom, rect.top, 0, range);
	        var viewMat = create$3();
	        lookAt(viewMat, [0, 0, 0], [0, 0, -1], [0, 1, 0]);
	        var model = create$3();
	        translate$2(model, model, [0, 0, -range/2]);
	        multiply$3(model, model, view.rotation);
	        progAtoms.setUniform("uProjection", "Matrix4fv", false, projection);
	        progAtoms.setUniform("uView", "Matrix4fv", false, viewMat);
	        progAtoms.setUniform("uModel", "Matrix4fv", false, model);
	        progAtoms.setUniform("uBottomLeft", "2fv", [rect.left, rect.bottom]);
	        progAtoms.setUniform("uTopRight", "2fv", [rect.right, rect.top]);
	        progAtoms.setUniform("uAtomScale", "1f", 2.5 * view.atomScale);
	        progAtoms.setUniform("uRelativeAtomScale", "1f", view.relativeAtomScale);
	        progAtoms.setUniform("uRes", "1f", resolution);
	        progAtoms.setUniform("uDepth", "1f", range);
	        progAtoms.setUniform("uMode", "1i", 0);
	        progAtoms.setUniform("uAtomShade", "1f", view.atomShade);
	        rAtoms.render();

	        if ((view.bonds || view.lattice) && rBonds != null) {
	            fbSceneColor.bind();
	            progBonds.setUniform("uProjection", "Matrix4fv", false, projection);
	            progBonds.setUniform("uView", "Matrix4fv", false, viewMat);
	            progBonds.setUniform("uModel", "Matrix4fv", false, model);
	            progBonds.setUniform("uRotation", "Matrix4fv", false, view.rotation);
	            progBonds.setUniform("uDepth", "1f", range);
	            progBonds.setUniform("uBottomLeft", "2fv", [rect.left, rect.bottom]);
	            progBonds.setUniform("uTopRight", "2fv", [rect.right, rect.top]);
	            progBonds.setUniform("uRes", "1f", resolution);
	            progBonds.setUniform("uBondShade", "1f", view.bondShade);
	            progBonds.setUniform("uAtomScale", "1f", 2.5 * view.atomScale);
	            progBonds.setUniform("uRelativeAtomScale", "1f", view.relativeAtomScale);
	            progBonds.setUniform("uMode", "1i", 0);
	            rBonds.render();
	        }
	    }


	    function normal(view) {
	        normalRendered = true;
	        gl.viewport(0, 0, resolution, resolution);
	        fbSceneNormal.bind();
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        var rect = getRect(view);
	        var projection = create$3();
	        ortho(projection, rect.left, rect.right, rect.bottom, rect.top, 0, range);
	        var viewMat = create$3();
	        lookAt(viewMat, [0, 0, 0], [0, 0, -1], [0, 1, 0]);
	        var model = create$3();
	        translate$2(model, model, [0, 0, -range/2]);
	        multiply$3(model, model, view.rotation);
	        progAtoms.setUniform("uProjection", "Matrix4fv", false, projection);
	        progAtoms.setUniform("uView", "Matrix4fv", false, viewMat);
	        progAtoms.setUniform("uModel", "Matrix4fv", false, model);
	        progAtoms.setUniform("uBottomLeft", "2fv", [rect.left, rect.bottom]);
	        progAtoms.setUniform("uTopRight", "2fv", [rect.right, rect.top]);
	        progAtoms.setUniform("uAtomScale", "1f", 2.5 * view.atomScale);
	        progAtoms.setUniform("uRelativeAtomScale", "1f", view.relativeAtomScale);
	        progAtoms.setUniform("uRes", "1f", resolution);
	        progAtoms.setUniform("uDepth", "1f", range);
	        progAtoms.setUniform("uMode", "1i", 1);
	        progAtoms.setUniform("uAtomShade", "1f", view.atomShade);
	        rAtoms.render();

	        if ((view.bonds || view.lattice) && rBonds != null) {
	            fbSceneNormal.bind();
	            progBonds.setUniform("uProjection", "Matrix4fv", false, projection);
	            progBonds.setUniform("uView", "Matrix4fv", false, viewMat);
	            progBonds.setUniform("uModel", "Matrix4fv", false, model);
	            progBonds.setUniform("uRotation", "Matrix4fv", false, view.rotation);
	            progBonds.setUniform("uDepth", "1f", range);
	            progBonds.setUniform("uBottomLeft", "2fv", [rect.left, rect.bottom]);
	            progBonds.setUniform("uTopRight", "2fv", [rect.right, rect.top]);
	            progBonds.setUniform("uRes", "1f", resolution);
	            progBonds.setUniform("uBondShade", "1f", view.bondShade);
	            progBonds.setUniform("uAtomScale", "1f", 2.5 * view.atomScale);
	            progBonds.setUniform("uRelativeAtomScale", "1f", view.relativeAtomScale);
	            progBonds.setUniform("uMode", "1i", 1);
	            rBonds.render();
	        }
	    }

	    function sample(view) {
	        gl.viewport(0, 0, aoResolution, aoResolution);
	        var v = clone$8(view);
	        v.zoom = 1/range;
	        v.translation.x = 0;
	        v.translation.y = 0;
	        var rot = create$3();
	        for (var i = 0; i < 3; i++) {
	            var axis = random(create$5(), 1.0);
	            rotate$3(rot, rot, Math.random() * 10, axis);
	        }
	        v.rotation = multiply$3(create$3(), rot, v.rotation);
	        fbRandRot.bind();
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        var rect = getRect(v);
	        var projection = create$3();
	        ortho(projection, rect.left, rect.right, rect.bottom, rect.top, 0, range);
	        var viewMat = create$3();
	        lookAt(viewMat, [0, 0, 0], [0, 0, -1], [0, 1, 0]);
	        var model = create$3();
	        translate$2(model, model, [0, 0, -range/2]);
	        multiply$3(model, model, v.rotation);
	        progAtoms.setUniform("uProjection", "Matrix4fv", false, projection);
	        progAtoms.setUniform("uView", "Matrix4fv", false, viewMat);
	        progAtoms.setUniform("uModel", "Matrix4fv", false, model);
	        progAtoms.setUniform("uBottomLeft", "2fv", [rect.left, rect.bottom]);
	        progAtoms.setUniform("uTopRight", "2fv", [rect.right, rect.top]);
	        progAtoms.setUniform("uAtomScale", "1f", 2.5 * v.atomScale);
	        progAtoms.setUniform("uRelativeAtomScale", "1f", view.relativeAtomScale);
	        progAtoms.setUniform("uRes", "1f", aoResolution);
	        progAtoms.setUniform("uDepth", "1f", range);
	        progAtoms.setUniform("uMode", "1i", 0);
	        progAtoms.setUniform("uAtomShade", "1f", view.atomShade);
	        rAtoms.render();

	        if ((view.bonds || view.lattice) && rBonds != null) {
	            progBonds.setUniform("uProjection", "Matrix4fv", false, projection);
	            progBonds.setUniform("uView", "Matrix4fv", false, viewMat);
	            progBonds.setUniform("uModel", "Matrix4fv", false, model);
	            progBonds.setUniform("uRotation", "Matrix4fv", false, v.rotation);
	            progBonds.setUniform("uDepth", "1f", range);
	            progBonds.setUniform("uBottomLeft", "2fv", [rect.left, rect.bottom]);
	            progBonds.setUniform("uTopRight", "2fv", [rect.right, rect.top]);
	            progBonds.setUniform("uRes", "1f", aoResolution);
	            progBonds.setUniform("uBondShade", "1f", view.bondShade);
	            progBonds.setUniform("uAtomScale", "1f", 2.5 * view.atomScale);
	            progBonds.setUniform("uRelativeAtomScale", "1f", view.relativeAtomScale);
	            progBonds.setUniform("uMode", "1i", 0);
	            rBonds.render();
	        }

	        gl.viewport(0, 0, resolution, resolution);
	        var sceneRect = getRect(view);
	        var rotRect = getRect(v);
	        var invRot = invert$3(create$3(), rot);
	        fbAccumulator.bind();
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        progAccumulator.setUniform("uSceneDepth", "1i", tSceneDepth.index);
	        progAccumulator.setUniform("uSceneNormal", "1i", tSceneNormal.index);
	        progAccumulator.setUniform("uRandRotDepth", "1i", tRandRotDepth.index);
	        progAccumulator.setUniform("uAccumulator", "1i", tAccumulator.index);
	        progAccumulator.setUniform("uSceneBottomLeft", "2fv", [sceneRect.left, sceneRect.bottom]);
	        progAccumulator.setUniform("uSceneTopRight", "2fv", [sceneRect.right, sceneRect.top]);
	        progAccumulator.setUniform("uRotBottomLeft", "2fv", [rotRect.left, rotRect.bottom]);
	        progAccumulator.setUniform("uRotTopRight", "2fv", [rotRect.right, rotRect.top]);
	        progAccumulator.setUniform("uRes", "1f", resolution);
	        progAccumulator.setUniform("uDepth", "1f", range);
	        progAccumulator.setUniform("uRot", "Matrix4fv", false, rot);
	        progAccumulator.setUniform("uInvRot", "Matrix4fv", false, invRot);
	        progAccumulator.setUniform("uSampleCount", "1i", sampleCount);
	        rAccumulator.render();
	        tAccumulator.activate();
	        tAccumulator.bind();
	        gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, resolution, resolution, 0);
	    }

	    function display(view) {
	        gl.viewport(0, 0, resolution, resolution);
	        if (view.fxaa > 0 || view.dofStrength > 0) {
	            fbAO.bind();
	        } else {
	            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	        }
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        progAO.setUniform("uSceneColor", "1i", tSceneColor.index);
	        progAO.setUniform("uSceneDepth", "1i", tSceneDepth.index);
	        progAO.setUniform("uAccumulatorOut", "1i", tAccumulatorOut.index);
	        progAO.setUniform("uRes", "1f", resolution);
	        progAO.setUniform("uAO", "1f", 2.0 * view.ao);
	        progAO.setUniform("uBrightness", "1f", 2.0 * view.brightness);
	        progAO.setUniform("uOutlineStrength", "1f", view.outline);
	        rAO.render();

	        if (view.fxaa > 0) {
	            if (view.dofStrength > 0) {
	                fbFXAA.bind();
	            } else {
	                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	            }
	            for (var i = 0; i < view.fxaa; i++) {
	                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	                if (i == 0) {
	                    progFXAA.setUniform("uTexture", "1i", tAO.index);
	                } else {
	                    progFXAA.setUniform("uTexture", "1i", tFXAA.index);
	                }
	                progFXAA.setUniform("uRes", "1f", resolution);
	                rFXAA.render();
	                tFXAA.activate();
	                tFXAA.bind();
	                gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, resolution, resolution, 0);
	            }
	        }

	        if (view.dofStrength > 0) {
	            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	            if (view.fxaa > 0) {
	                progDOF.setUniform("uColor", "1i", tFXAA.index);
	            } else {
	                progDOF.setUniform("uColor", "1i", tAO.index);
	            }
	            progDOF.setUniform("uDepth", "1i", tSceneDepth.index);
	            progDOF.setUniform("uDOFPosition", "1f", view.dofPosition);
	            progDOF.setUniform("uDOFStrength", "1f", view.dofStrength);
	            progDOF.setUniform("uRes", "1f", resolution);
	            rDOF.render();
	        }


	        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        // progDisplayQuad.setUniform("uTexture", "1i", tSceneColor.index);
	        // progDisplayQuad.setUniform("uRes", "1f", resolution);
	        // rDispQuad.render();
	    }

	    self.initialize();
	};


	function loadProgram(gl, src) {
	    src = src.split('// __split__');
	    return new Program(gl, src[0], src[1]);
	}

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

	    this._view =  View();
	    add_event_handlers(canvas, this._view);

	    // Rendering pipeline
	    this._renderer = new Renderer(canvas, this._view.resolution, this._view.aoRes);
	    this._renderer.setResolution(this._view.resolution, this._view.aoRes);
	    this._system = System();

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
	    resolve(this._view);

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
	    this._system = System();

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

	        addAtom(this._system, atom.symbol, x, y, z);
	    }

	    if (data.lattice) {
	        var l = data.lattice;
	        this._system.lattice.matrix = fromValues$3(
	            l[0], l[1], l[2], 0,
	            l[3], l[4], l[5], 0,
	            l[6], l[7], l[8], 0,
	            0, 0, 0, 1);

	    } else {
	        this._system.lattice.matrix = fromValues$3(
	            maxx-minx, 0, 0, minx,
	            0, maxy-miny, 0, miny,
	            0, 0, maxz-minz, minz,
	            0, 0, 0, 1);
	    }

	    center$1(this._system);

	    if (this._view.lattice) {
	        calculateLattice(this._system);
	    }

	    if (this._view.bonds) {
	        calculateBonds(this._system);
	    }

	    this._renderer.setSystem(this._system, this._view);
	    center(this._view, this._system);
	    needReset = true;

	    render(this._view, this._renderer);
	};


	StructureViewProto.attributeChangedCallback = function(attrName, oldValue, newValue) {
	    if (attrName === "bonds") {
	        if (this.hasAttribute("bonds")) {
	            calculateBonds(this._system);
	            this._view.bonds = true;
	            this._view = extend(this._view, config.atomsbonds);
	        } else {
	            this._view.bonds = false;
	            this._view = extend(this._view, config.atoms);
	        }
	        resolve(this._view);
	        this._renderer.setSystem(this._system, this._view);
	        needReset = true;
	    } else if (attrName === "lattice") {
	        if (this.hasAttribute("lattice")) {
	            calculateLattice(this._system);
	            this._view.lattice = true;
	        } else {
	            this._view.lattice = false;
	        }
	        resolve(this._view);
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
	            translate$5(view, dx, dy);
	        } else {
	            rotate$4(view, dx, dy);
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
	        resolve(view);
	        needReset = true;

	        e.preventDefault();
	    });
	}

}));