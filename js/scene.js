import { Camera } from "./camera.js"
import { Controls } from './controls.js';
import { RenderMeshBary } from "./rendermesh-bary.js";
import { makeCube } from './cube.js';
import { makeSquare } from './square.js';
import { makeBottom } from './bottom.js';
import { makeTop } from './top.js';
import { makeFloor } from './basic-floor.js';
import { loadObjMesh } from './objloader.js';
import { loadTexture, loadImgData } from './main.js';

import * as glMatrix from './gl-matrix/common.js';
import * as mat4 from "./gl-matrix/mat4.js";
import * as vec3 from './gl-matrix/vec3.js';

/**
 * Represents the entire (world) scene.
 */
export class Scene {

    /**
     * Constructs a Scene object.
     *
     * @param {WebGL2RenderingContext} gl
     * @param {HTMLElement} canvas the canvas element
     */
    constructor(gl, canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        // Variables used to store the model, view and projection matrices.
        this.modelMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();

        // Create the camera object and set to default position/orientation
        this.camera = new Camera();
        this.resetCamera();

        // Lights
        this.world = {
            camLightPos: this.camera.eye,     // Camera attached light position (camera coords.)
            camLightColor: [0.0, 0.0, 0.0],   // Color of camera attached light
            worldLightPos: [0, 1500, 0],    // World space light position (world coords.)
            worldLightColor: [1, 1, 1],      // Color of world space light
        };

        this.flashlight = false;

        // The projection type
        this.projType = "perspective";

        // The camera mode
        this.mode = "player";
        this.speed = 0.4;

        // UI manager object
        this.controls = new Controls(this.canvas, this);

        // Create the meshes for the scene
        this.cube = new RenderMeshBary(gl, makeCube());
        this.square = new RenderMeshBary(gl, makeSquare());
        this.bottom = new RenderMeshBary(gl, makeBottom());
        this.top = new RenderMeshBary(gl, makeTop());

        // Data for floor
        this.floor = null;
        this.heightData = null
        loadImgData('data/maze2.png').then((data) => {
            this.floor = new RenderMeshBary(gl, makeFloor(data));
            this.heightData = data;
        });

        this.tree = null;
        fetch('data/tree/Tree.obj')
            .then((response) => {
                return response.text();
            })
            .then((text) => {
                let objMesh = loadObjMesh(text);
                this.tree = new RenderMeshBary(gl, objMesh);
            });

        this.palm = null;
        fetch('data/palm.obj')
            .then((response) => {
                return response.text();
            })
            .then((text) => {
                let objMesh = loadObjMesh(text);
                this.palm = new RenderMeshBary(gl, objMesh);
            });

        this.sphere = null;
        fetch('data/sphere.obj')
            .then((response) => {
                return response.text();
            })
            .then((text) => {
                let objMesh = loadObjMesh(text);
                this.sphere = new RenderMeshBary(gl, objMesh);
            });

        // Load textures
        this.barkTexture = null;
        loadTexture('data/tree/bark.jpg').then((tex) => {
            this.barkTexture = tex;
        });

        this.leavesTexture = null;
        loadTexture('data/tree/leaves.png').then((tex) => {
            this.leavesTexture = tex;
        });

        this.redTexture = null;
        loadTexture('data/red.png').then((tex) => {
            this.redTexture = tex;
        });

        this.greenTexture = null;
        loadTexture('data/green.png').then((tex) => {
            this.greenTexture = tex;
        });

        this.crateTexture = null;
        loadTexture('data/woodcrate-S.png').then((tex) => {
            this.crateTexture = tex;
        });

        this.checkerboardTexture = null;
        loadTexture('data/checkerboard.png').then((tex) => {
            this.checkerboardTexture = tex;
        });

        this.sandTexture = null;
        loadTexture('data/sand4.jpg').then((tex) => {
            this.sandTexture = tex;
        });

        this.topTexture = null;
        loadTexture('data/skybox/top2.png').then((tex) => {
            this.topTexture = tex;
        });

        this.frontTexture = null;
        loadTexture('data/skybox/front.png').then((tex) => {
            this.frontTexture = tex;
        });

        this.backTexture = null;
        loadTexture('data/skybox/back2.png').then((tex) => {
            this.backTexture = tex;
        });

        this.leftTexture = null;
        loadTexture('data/skybox/left.png').then((tex) => {
            this.leftTexture = tex;
        });

        this.rightTexture = null;
        loadTexture('data/skybox/right.png').then((tex) => {
            this.rightTexture = tex;
        });

        this.bottomTexture = null;
        loadTexture('data/skybox/bottom.png').then((tex) => {
            this.bottomTexture = tex;
        });

        this.goldTexture = null;
        loadTexture('data/gold.jpg').then((tex) => {
            this.goldTexture = tex;
        });
    }

    pollKeys() {
        if (document.pointerLockElement !== document.getElementById('draw-canvas')) return;

        // Tracking
        if (this.controls.keyDown("KeyW")) {
            if (this.mode === "fly") this.camera.track(0, 0, -1.25);
            else this.camera.track(0, 0, -1 * this.speed);
            this.camera.getViewMatrix(this.viewMatrix);
        }
        if (this.controls.keyDown("KeyS")) {
            if (this.mode === "fly") this.camera.track(0, 0, 1.25);
            else this.camera.track(0, 0, 0.25);
            this.camera.getViewMatrix(this.viewMatrix);
        }
        if (this.controls.keyDown("KeyA")) {
            if (this.mode === "fly") this.camera.track(-1.25, 0, 0);
            else this.camera.track(-0.25, 0, 0);
            this.camera.getViewMatrix(this.viewMatrix);
        }
        if (this.controls.keyDown("KeyD")) {
            if (this.mode === "fly") this.camera.track(1.25, 0, 0);
            else this.camera.track(0.25, 0, 0);
            this.camera.getViewMatrix(this.viewMatrix);
        }
        if (this.controls.keyDown("KeyQ")) {
            if (this.mode === "fly") this.camera.track(0, 1.25, 0);
            else this.camera.track(0, 0.25, 0);
            this.camera.getViewMatrix(this.viewMatrix);
        }
        if (this.controls.keyDown("KeyE")) {
            if (this.mode === "fly") this.camera.track(0, -1.25, 0);
            else this.camera.track(0, -0.25, 0);
            this.camera.getViewMatrix(this.viewMatrix);
        }
        if (this.controls.keyDown("KeyF")) {
          this.world.camLightColor = [0.1, 0.1, 0.1];
        }

    }

    setSpeed(x) {
        this.speed = x;
    }

    setWorldColor(x) {
        this.world.worldLightColor = x;
    }

    leftDrag(deltaX, deltaY) {
        this.camera.orbit(-deltaX / 100, -deltaY / 100);
        this.camera.getViewMatrix(this.viewMatrix);
    }

    turn(deltaX, deltaY) {
        this.camera.turn(-deltaX / 800, -deltaY / 800);
        this.camera.getViewMatrix(this.viewMatrix);
    }

    init(gl, shader) {
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.uniform3fv(shader.uniform('lightColors[0]'), this.world.camLightColor);
        gl.uniform3fv(gl.getUniformLocation(shader.programId, 'lightColors[1]'), this.world.worldLightColor);
        gl.uniform3fv(shader.uniform('lightPositions[0]'), vec3.transformMat4(vec3.create(), this.camera.eye, this.viewMatrix));
    }

    drawScene(gl, shader) {
        const lightPos = vec3.transformMat4(vec3.create(), this.world.worldLightPos, this.viewMatrix);
        gl.uniform3fv(gl.getUniformLocation(shader.programId, 'lightPositions[1]'), lightPos);

        gl.uniform3fv(gl.getUniformLocation(shader.programId, 'lightColors[0]'), this.world.camLightColor);

        gl.uniform3fv(shader.uniform('cameraDirection'), vec3.fromValues(this.camera.w[0], this.camera.w[1], -10))

        let exposure = shader.uniform('exposure');
        let alpha = shader.uniform('alpha');
        gl.uniform1f(exposure, 50000000);
        gl.uniform1f(alpha, .01);




        // Create tree mesh
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [220, -40, 220]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [100, 70, 100]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.goldTexture);
        if (this.tree !== null) this.tree.render(gl, shader);

        gl.uniform1f(exposure, 10000000);
        gl.uniform1f(alpha, 1.0);

        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [-230, -40, 220]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [25, 25, 25]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.barkTexture);
        if (this.tree !== null) this.tree.render(gl, shader);

        // Create palm
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [-220, -40, -200]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [7, 7, 7]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.greenTexture);
        if (this.palm !== null) this.palm.render(gl, shader);

        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [170, -40, 170]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [1, 1, 1]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        if (this.palm !== null) this.palm.render(gl, shader);

        mat4.translate(this.modelMatrix, this.modelMatrix, [-130, 0, -150]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [10, 10, 10]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        if (this.palm !== null) this.palm.render(gl, shader);

        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, -30, -240]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [7, 7, 7]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        if (this.palm !== null) this.palm.render(gl, shader);

        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, -30, -200]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [2, 2, 2]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        if (this.palm !== null) this.palm.render(gl, shader);

        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, -30, -200]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [2, 2, 2]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        if (this.palm !== null) this.palm.render(gl, shader);

        mat4.identity(this.modelMatrix);
        mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI / 2, [1, 0, 0]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.sandTexture);
        if (this.floor !== null) this.floor.render(gl, shader);

        // Reset the model matrix to the identity
        mat4.identity(this.modelMatrix);
    }

    drawSkybox(gl, shader) {
        let x = 500;
        let s = 2 * x;
        let y = 100;

        // Draw the top
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, x - y, 0]);
        mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI / 2.0, [1, 0, 0]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [s, s, 1]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.topTexture);
        this.top.render(gl, shader);

        // Draw the front
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [x, 0 - y, 0]);
        mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI / 2.0, [0, 1, 0]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [s, s, 1]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.frontTexture);
        this.square.render(gl, shader);

        // Draw the back
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [-x, 0 - y, 0]);
        mat4.rotate(this.modelMatrix, this.modelMatrix, Math.PI / 2.0, [0, 1, 0]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [s, s, 1]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.backTexture);
        this.square.render(gl, shader);

        // Draw the left
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0 - y, -x]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [s, s, 1]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.leftTexture);
        this.square.render(gl, shader);

        // Draw the front
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0 - y, x]);
        mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI, [0, 1, 0]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [s, s, 1]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.rightTexture);
        this.square.render(gl, shader);

        // Draw the bottom
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, -x / 2, 0]);
        mat4.scale(this.modelMatrix, this.modelMatrix, [s, 1, s]);
        mat4.rotate(this.modelMatrix, this.modelMatrix, -Math.PI / 2.0, [1, 0, 0]);
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.bottomTexture);
        this.bottom.render(gl, shader);
    }

    /*
    *
    *   Less used methods
    *
    */

    resize(gl, width, height) {
        this.width = width;
        this.height = height;
        this.setProjectionMatrix();

        // Sets the viewport transformation
        gl.viewport(0, 0, width, height);
    }

    setProjectionMatrix() {
        const aspect = this.width / this.height;
        if (this.projType === "perspective") mat4.perspective(this.projMatrix, glMatrix.toRadian(45.0), aspect, 0.1, 10000.0);
        else mat4.ortho(this.projMatrix, -30 * aspect, 30 * aspect, -30.0, 30.0, 0.001, 1000.0);
    }

    resetCamera() {
        // Set the camera's default position/orientation
        if (this.mode === "fly") {
            this.camera.orient([3, 350, 305], [0, 0, 0], [0, 1, 0]);
        }
        if (this.mode === "player") {
            this.camera.orient([-233, -27, -234], [-225, -27, -222], [0, 1, 0])
        }

        // Retrieve the new view matrix
        this.camera.getViewMatrix(this.viewMatrix);
    }

    setViewVolume(type) {
        this.projType = type;
        this.setProjectionMatrix();
    }

    setMode(type) {
        this.mode = type;
        this.camera.setMode(type);
    }

    setMatrices(gl, shader) {
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.uniformMatrix4fv(shader.uniform('uView'), false, this.viewMatrix);
        gl.uniformMatrix4fv(shader.uniform('uProj'), false, this.projMatrix);
    }

    render(time, gl, shader1, shader2, shader3) {
        this.pollKeys();

        // Draw the objects using shader
        shader1.use(gl);
        this.setMatrices(gl, shader1);
        this.drawScene(gl, shader1);

        shader2.use(gl);
        this.setMatrices(gl, shader2);
        this.drawSkybox(gl, shader2);
    }

    shiftLeftDrag(deltaX, deltaY) {
        if (this.mode !== "fly") return;
        this.camera.orbit(-deltaX / 100, -deltaY / 100);
        this.camera.getViewMatrix(this.viewMatrix);
    }

    mouseWheel(delta) {
        if (document.pointerLockElement !== document.getElementById('draw-canvas')) return;
        this.camera.dolly(delta);
        this.camera.getViewMatrix(this.viewMatrix);
    }

}
