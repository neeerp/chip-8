import Keyboard from "./keyboard.js";
import Renderer from "./renderer.js";
import Speaker from "./speaker.js";
import CPU from "./cpu.js";

const keyboard = new Keyboard();
const renderer = new Renderer(16);
const speaker = new Speaker();
const cpu = new CPU(renderer, keyboard, speaker);

let fps = 60;
let loop, fpsInterval, startTime, now, then, elapsed;

/**
 * Enter the main rendering loop.
 */
function init() {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;

    cpu.loadSpritesIntoMemory();
    cpu.loadRom('astro.ch8');
    loop = requestAnimationFrame(step);
}


/**
 * A run of the main rendering loop.
 */
function step() {
    now = Date.now();

    elapsed = now - then;

    if (elapsed > fpsInterval) {
        cpu.cycle();
    }

    loop = requestAnimationFrame(step);
}

init();
