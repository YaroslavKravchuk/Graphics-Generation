/**
 * Manages the event listeners for keyboard, mouse and DOM events.
 */
export class Controls {

    /**
     * Constructs a Controls object and adds the appropriate event
     * listeners to DOM elements.
     *
     * @param {DOMElement} canvas the canvas element
     * @param {Scene} scene the Scene object
     */
    constructor(canvas, scene) {
        this.canvas = canvas;
        this.scene = scene;
        this.mousePrevious = null;
        this.downKeys = new Set();
        this.mode = "player";

        // Click to play listener
        document.getElementById('instructions').addEventListener('click', this.lock);

        // Keyboard listeners
        document.addEventListener("keydown", (e) => {
            if (e.code === "Escape") {
                this.unlock();
            } else if (e.code === "KeyX") {
                document.getElementById('scoreboard-blocker').style.display = "block";
            } else if (e.code === "ShiftLeft") {
                this.scene.setSpeed(.8);
            } else {
                this.downKeys.add(e.code);

                // Prevent the space key from scrolling
                if (e.code === "Space") e.preventDefault();
            }
        });
        document.addEventListener("keyup", (e) => {
            this.downKeys.delete(e.code);
            if (e.code === "KeyX") {
                document.getElementById('scoreboard-blocker').style.display = "none";
            } else if (e.code === "ShiftLeft") {
                this.scene.setSpeed(0.4);
            }
            if (e.code === "Space") e.preventDefault();
            if (e.code === "KeyF") this.scene.world.camLightColor = [0.0, 0.0, 0.0];
        });

        // Mouse listeners
        document.addEventListener('pointerlockchange', (e) => {
            if (document.pointerLockElement === document.getElementById('draw-canvas')) {
                document.addEventListener('mousemove', (e) => { this.mouseMoveEvent(e, e.movementX, e.movementY) });
            } else {
                // Removing the event listener doesn't work for some reason
                document.removeEventListener('mousemove', (e) => { this.mouseMoveEvent(e, e.movementX, e.movementY) });
                this.unlock();
            }
        });

        // Mouse wheel listener
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.scene.mouseWheel(e.deltaY);
        });

        // Controls
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', (e) => this.scene.resetCamera());

        document.getElementById('fly-mode-rb').addEventListener('change', (e) => this.modeChange(e));
        document.getElementById('player-mode-rb').addEventListener('change', (e) => this.modeChange(e));
    }

    /**
     * Returns true if the key is currently down, false otherwise.
     *
     * @param {string} key the key code (e.g. "KeyA", "KeyB", etc.) see:
     *   https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
     *   for details on the key codes.
     */
    keyDown(key) {
        return this.downKeys.has(key);
    }

    /**
     * Called when a mousemove event is received.
     *
     * @param {MouseEvent} e the MouseEvent object
     */
    mouseMoveEvent(e, xc, yc) {
        if (document.pointerLockElement !== document.getElementById('draw-canvas')) return;

        const x = xc, y = yc;

        if (e.buttons === 1 && this.mode === "fly") {
            if (e.shiftKey) {
                this.scene.shiftLeftDrag(deltaX, deltaY);
            } else {
                this.scene.leftDrag(x, y);
            }
        } else {
            this.scene.turn(x, y);
        }
    }


    /**
     * Called when the perspective/orthographic radio button is changed.
     *
     * @param {Event} e
     */
    perspOrthoChange(e) {
        if (e.target.value === "perspective") {
            this.scene.setViewVolume("perspective");
        } else {
            this.scene.setViewVolume("orthographic");
        }
    }

    /**
     * Called when the fly/mouse mode radio button is changed.
     *
     * @param {Event} e
     */
    modeChange(e) {
        if (e.target.value === "fly") {
            this.scene.setMode("fly");
            this.mode = "fly";
        } else {
            this.scene.setMode("player");
            this.mode = "player";
        }
    }

    /**
     * Called when the "Click to play" HTML div is clicked on. This
     * locks the pointer in place.
     */
    lock() {
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('blocker').style.display = 'none';
        document.getElementById('draw-canvas').requestPointerLock();
    }

    /**
     * Called when the "escape" button is pressed to exit the pointer
     * lock. 
     */
    unlock() {
        document.getElementById('blocker').style.display = 'block';
        document.getElementById('instructions').style.display = '';
    }

}
