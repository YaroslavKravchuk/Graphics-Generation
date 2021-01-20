import * as mat4 from './gl-matrix/mat4.js';
import * as vec3 from './gl-matrix/vec3.js';
import { loadImgData, heightAt } from './main.js';

/**
 * A class that represents a camera's coordinate system.
 */
export class Camera {

    /**
     * Constructs the camera with a default position and orientation.
     *
     * Default position: (0,1,5)
     * Default orientation:  target (0,0,0), up( 0,1,0 )
     */
    constructor() {
        // Camera's position
        this.eye = [-233, -27, -234];

        this.heightData = null;
        loadImgData('data/maze2.png').then((data) => {
            let hd = [];
            for (let i = 2; i < data.length; i += 4) {
                hd.push(data[i]);
            }
            this.heightData = hd;
        });

        // Camera's u, v, w axes
        this.u = [1, 0, 0];
        this.v = [0, 1, 0];
        this.w = [0, 0, 1];

        // Orient the camera to a default orientation
        this.orient([-233, -27, -234], [-225, -27, -222], [0, 1, 0]);

        // Rotation and translation matrix, initially set to I
        this.rotation = mat4.create();
        this.translation = mat4.create();

        this.mode = "player";
    }

    /**
     * Orient the camera
     *
     * @param {vec3} eye camera position
     * @param {vec3} at camera target (the point the camera looks towards)
     * @param {vec3} up the up direction
     */
    orient(eye, at, up) {
        // Set the camera's position
        this.eye = eye;

        // Compute the camera's axes
        // w = eye - at
        vec3.subtract(this.w, this.eye, at);
        vec3.normalize(this.w, this.w);
        // u = up x w
        vec3.cross(this.u, up, this.w);
        vec3.normalize(this.u, this.u);
        // v = w x u
        vec3.cross(this.v, this.w, this.u);
        vec3.normalize(this.v, this.v);
    }

    /**
     * Compute and return the view matrix for this camera.  This is the
     * matrix that converts from world coordinates to camera coordinates.
     *
     * @param {mat4} out the view matrix is written to this parameter
     */
    getViewMatrix(out) {
        // The inverse rotation
        mat4.set(this.rotation,
            this.u[0], this.v[0], this.w[0], 0,
            this.u[1], this.v[1], this.w[1], 0,
            this.u[2], this.v[2], this.w[2], 0,
            0, 0, 0, 1);

        // The inverse translation
        this.translation[12] = -this.eye[0];
        this.translation[13] = -this.eye[1];
        this.translation[14] = -this.eye[2];

        // View matrix = inverse rotation * inverse translation
        mat4.multiply(out, this.rotation, this.translation);
    }

    getEye(x) {
        return vec3.transformMat4(vec3.create(), this.eye, x);
        //return vec3.transformMat4(vec3.create(), vec3.rotateZ(vec3.create(), this.eye, [0,0,0], 1.5), x);
    }

    /**
     * Rotates this camera around the camera's u-axis by vertAngle, and
     * around the y-axis by horizAngle.
     *
     * @param {Number} horizAngle horizontal rotation angle (radians)
     * @param {Number} vertAngle vertical rotation angle (radians)
     */
    orbit(horizAngle, vertAngle) {
        // TODO: Part 2
        // Implement this method to modify this.eye, this.u, this.v, and this.w by
        // rotating them around the camera's u-axis by vertAngle and around the world's
        // y-axis by horizAngle.
        mat4.identity(this.rotation);

        mat4.rotateY(this.rotation, this.rotation, horizAngle);
        mat4.rotate(this.rotation, this.rotation, vertAngle, this.u);

        vec3.transformMat4(this.eye, this.eye, this.rotation);
        vec3.transformMat4(this.u, this.u, this.rotation);
        vec3.transformMat4(this.v, this.v, this.rotation);
        vec3.transformMat4(this.w, this.w, this.rotation);

        // Reset the rotation matrix
        mat4.identity(this.rotation);
    }

    /**
     * Rotates the camera's axes (but not its position) around the camera's u-axis
     * by vertAngle and around the y-axis by horizAngle.
     *
     * @param {Number} horizAngle horizontal rotation angle (radians)
     * @param {Number} vertAngle vertical rotation angle (radians)
     */
    turn(horizAngle, vertAngle) {
        mat4.identity(this.rotation);

        mat4.rotateY(this.rotation, this.rotation, horizAngle);
        mat4.rotate(this.rotation, this.rotation, vertAngle, this.u);

        if (this.mode === "fly") {
            vec3.transformMat4(this.u, this.u, this.rotation);
            vec3.transformMat4(this.v, this.v, this.rotation);
            vec3.transformMat4(this.w, this.w, this.rotation);
        } else {
            let wV = vec3.transformMat4(this, this.w, this.rotation);
            let y = [0, 1, 0];
            if (!(Math.acos(vec3.dot(wV, y)) < 0.8727) && !(Math.acos(vec3.dot(wV, y)) > 2.618)) {
                vec3.transformMat4(this.u, vec3.normalize(this, this.u), this.rotation);
                vec3.transformMat4(this.v, vec3.normalize(this, this.v), this.rotation);
                vec3.transformMat4(this.w, vec3.normalize(this, this.w), this.rotation);
            }
        }

        // Reset the rotation matrix
        mat4.identity(this.rotation);
    }

    track(deltaU, deltaV, deltaW) {
        mat4.identity(this.translation);

        mat4.translate(this.translation, this.translation, vec3.scale(this, vec3.normalize(this, this.u), deltaU));

        if (this.mode === "fly") {
            mat4.translate(this.translation, this.translation, vec3.scale(this, vec3.normalize(this, this.v), deltaV));
            mat4.translate(this.translation, this.translation, vec3.scale(this, vec3.normalize(this, this.w), deltaW));
        } else {
            mat4.translate(this.translation, this.translation, vec3.scale(this, vec3.normalize(this, [this.w[0], 0, this.w[2]]), deltaW));
        }

        if (heightAt(vec3.transformMat4(vec3.create(), this.eye, this.translation), this.heightData) > 24 || this.mode === "fly") {
             vec3.transformMat4(this.eye, this.eye, this.translation);
        }

        //vec3.transformMat4(this.eye, this.eye, this.translation);
        //console.log(this.eye);

        mat4.identity(this.translation);
    }

    dolly(delta) {
        mat4.identity(this.translation);
        mat4.translate(this.translation, this.translation, vec3.scale(this, this.w, delta));
        vec3.transformMat4(this.eye, this.eye, this.translation);
        mat4.identity(this.translation);
    }

    setMode(type) {
        this.mode = type;
    }

}
