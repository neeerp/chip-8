import Renderer from "./renderer.js";

const renderer = new Renderer(16);

let fps = 60;
let loop, fpsInterval, startTime, now, then, relapsed;

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
        // Busywait... for now.
    }

    loop = requestAnimationFrame(step);
}

init();
