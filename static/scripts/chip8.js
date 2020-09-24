import Keyboard from "./keyboard.js";
import Renderer from "./renderer.js";
import Speaker from "./speaker.js";

const keyboard = new Keyboard();
const renderer = new Renderer(16);
const speaker = new Speaker();

let fps = 60;
let loop, fpsInterval, startTime, now, then, elapsed;

/**
 * Enter the main rendering loop.
 */
function init() {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;

    // TODO: Remove this
    renderer.testRenderer();
    renderer.render();
    // TODO: Remove this

    loop = requestAnimationFrame(step);
}


/**
 * A run of the main rendering loop.
 */
function step() {
    now = Date.now();

    elapsed = now - then;

    if (elapsed > fpsInterval) {
        if (keyboard.isKeyPressed(keyboard.KEYMAP[0x1])) {
            speaker.play(440);
        } else {
            speaker.stop();
        }
    }

    loop = requestAnimationFrame(step);
}

init();
