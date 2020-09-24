// This class will handle everything graphics related.
class Renderer {

    /**
     * Construct a renderer object.
     *
     * @param {int} scale - The scale factor of our display.
     */
    constructor(scale) {
        // The Chip8 specification states that the display size is 64x32 pixels.
        this.cols = 64;
        this.rows = 32;

        this.scale = scale;
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");

        // Scale the screen up by the given scale factor. 
        this.canvas.width = this.cols * this.scale;
        this.canvas.height = this.rows * this.scale;

        this.display = new Array(this.cols * this.rows);
    }

    /**
     * Toggle a display pixel on and off. Returns whether a pixel was erased.
     * 
     * @param {int} x An x coordinate. Coordinates outside [0, 63] wrap.
     * @param {int} y A y coordinate. Coordinates outside [0, 31] wrap.
     * @returns {boolean} - Flag for pixel erasure.
     */
    setPixel(x, y) {
        x = x % this.cols;
        y = y % this.rows;

        let displayIdx = x + (y * this.cols);
        this.display[displayIdx] ^= 1;

        return !this.display[displayIdx];
    }

    /**
     * Clear the display.
     */
    clear() {
        this.display = new Array(this.cols * this.rows);
    }

    /**
     * Render the pixels in this.display.
     */
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.cols * this.rows; i++) {
            let x = (i % this.cols) * this.scale;
            let y = Math.floor(i / this.cols) * this.scale;

            if (this.display[i]) {
                this.ctx.fillStyle = "#000";

                this.ctx.fillRect(x, y, this.scale, this.scale);
            }
        }
    }

    testRenderer() {
        this.setPixel(0, 0);
        this.setPixel(5, 2);
    }

}

export default Renderer;
