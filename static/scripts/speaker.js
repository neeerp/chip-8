/**
 * This module handles audio output.
 */
class Speaker {
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        this.audioCtx = new AudioContext();

        // This gain will allow us to control volume.
        this.gain = this.audioCtx.createGain();
        this.finish = this.audioCtx.destination;

        // gain has to be connected to the audio context.
        this.gain.connect(this.finish);
    }

    /**
     * Plays a sound.
     *
     * @param {int} frequency - The frequency of the sound.
     */
    play(frequency) {
        if (this.audioCtx && !this.oscillator) {
            this.oscillator = this.audioCtx.createOscillator();

            this.oscillator.frequency.setValueAtTime(frequency || 440, this.audioCtx.currentTime);
            this.oscillator.type = "square";

            this.oscillator.connect(this.gain);
            this.oscillator.start();
        }
    }

    /**
     * Stops playing sound.
     */
    stop() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }
}

export default Speaker;
