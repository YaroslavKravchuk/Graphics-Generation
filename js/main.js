import * as ShaderCode from './shadercode.js';
import { ShaderProgram } from './shader.js';
import * as ShaderCode2 from './shadercode2.js';
import { Scene } from './scene.js';

import * as glMatrix from './gl-matrix/common.js';

let gl = null;           // The WebGL context object
let canvas = null;       // The canvas element
let shader1 = null;   // The shader program for the objects
let shader2 = null;
let shader3 = null;
let scene = null;        // The scene

window.addEventListener("load", main);

/*
* Authors: Keller DeBord, Yaroslav Kravchuk
* Start date: 22 April 2020
* End date:   19 May 2020
*
* Description: Our program creates a scene with a skybox, complex objects, and variable lighting. 
*              It contains the ability to fly or walk around the scene. The scene is a sandy maze
*              that contains trees and palms. The goal is to get through the maze to reach the
*              golden tree. 
*
* Controls: Movement: WASD (and QE if in "fly" mode)
*           Sprint: Left Shift
*           Looking: Mouse movement
*           Scoreboard: Hold X
*           Flashlight: Hold F
*/

function main() {
    glMatrix.setMatrixArrayType(Array);

    // Initialize the WebGL context
    canvas = document.getElementById('draw-canvas');
    gl = canvas.getContext("webgl2");

    // Setup WebGL
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Compile and link the shader
    shader1 = ShaderProgram.compile(gl, ShaderCode.VERT_CODE, ShaderCode.FRAG_CODE);
    shader1.use(gl);

    shader2 = ShaderProgram.compile(gl, ShaderCode2.VERT_CODE, ShaderCode2.FRAG_CODE);

    window.addEventListener('resize', resize);
    scene = new Scene(gl, canvas);
    scene.init(gl, shader1);

    resize();
    startAnimation();
}

export function loadTexture(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', () => {
            console.error("Unable to load texture: " + url);
            reject("Unable to load texture: " + url);
        });
        img.src = url;
    }).then((image) => {
        // Create the texture object
        const texture = gl.createTexture();

        const levels = Math.floor( Math.log2(image.width) );

        // Bind to the texture and set texture parameters
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, levels);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        // Create storage and load the texture
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, image.width, image.height);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Generate mipmaps
        gl.generateMipmap(gl.TEXTURE_2D);

        // console.log(`Loaded texture: ${url} (${image.width} x ${image.height})`);
        return texture;
    });
}

// This new method is converting and Image to a canvas,
// and reading the data from the canvas, so that we could use that data for a heightMap.

export function loadImgData(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.src = url;
  }).then((img) => {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var imageData = ctx.getImageData(0, 0, img.width, img.height);
    return imageData.data;
  });
}

export function heightAt(eye, heightData) {
  let x = Math.round((eye[0] + 256)/1);
  let y = Math.round((eye[2] + 256)/1);
  if (heightData === null) return 100;
  //console.log(heightData[(512*x + y)]/10.0);
  //console.log(heightData);
  //console.log((512*x + y));
  return heightData[(512*x + y)]/10;
}

/**
 * Called when the window is resized.
 */
function resize() {
    const el = document.getElementById('draw-container');
    const w = el.clientWidth, h = el.clientHeight;
    canvas.width = w;
    canvas.height = h;
    scene.resize(gl, w, h);
}

/**
 * This starts our animation "loop".  It might look a bit like a recursive
 * loop, but that's not quite what's happening.  It uses the function:
 * window.requestAnimationFrame to schedule a call to the frameFunction.
 * The frameFunction draws the scene by calling draw, and then requests
 * another call to frameFunction.  This function should only be called once
 * to start the animation.
 */
function startAnimation() {
    const frameFunction = (time) => {
        draw(time);
        window.requestAnimationFrame(frameFunction);
    };
    window.requestAnimationFrame(frameFunction);
}

/**
 * Draws the scene.  This function should not be called directly.
 * @param {Number} t animation time in milliseconds
 */
function draw(t) {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the scene
    scene.render(t, gl, shader1, shader2);
}
