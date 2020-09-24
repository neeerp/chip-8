/**
 * Keyboard mapping for ASCII -> Chip-8.
 */
class Keyboard {
    constructor() {
        this.KEYMAP = {
            49: 0x1, // 1
            50: 0x2, // 2
            51: 0x3, // 3
            52: 0xc, // 4
            81: 0x4, // Q
            87: 0x5, // W
            69: 0x6, // E
            82: 0xD, // R
            65: 0x7, // A
            83: 0x8, // S
            68: 0x9, // D
            70: 0xE, // F
            90: 0xA, // Z
            88: 0x0, // X
            67: 0xB, // C
            86: 0xF  // V
        }

        // Track current keydowns
        this.keysPressed = [];

        // Instruction based handler for the next key press.
        this.onNextKeyPress = null;

        window.addEventListener("keydown", this.onKeyDown.bind(this), false);
        window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    }

    /**
     * Returns whether the given key is currently pressed.
     *
     * @param {int} keyCode - A chip8 key code
     * @return {boolean} Flag indicating that the given key was pressed.
     */
    isKeyPressed(keyCode) {
        return this.keysPressed(keyCode);
    }

    /**
     * Handle a keydown event, adding the respective key to the pressed keys
     * array.
     *
     * @param {Event} event - A keydown event.
     */
    onKeyDown(event) {
        let key = this.KEYMAP[event.which];
        this.keyPressed[key] = true;

        // Apply 'next key' handler if one is present and then nullify it.
        if (this.onNextKeyPress !== null && key) {
            this.onNextKeyPress(parseInt(key));
            this.onNextKeyPress = null;
        }
    }

    /**
     * Handle a keyup event, removing the respective key from the pressed keys
     * array.
     *
     * @param {Event} event - A keyup event.
     */
    onKeyUp(event) {
        let key = this.KEYMAP[event.which];
        this.keysPressed[key] = false;
    }
}

export default Keyboard;

