const OFFSET = 0x200;

class CPU {

    /**
     * 
     *
     * @param {Renderer} renderer - A display renderer.
     * @param {Keyboard} keyboard - A keyboard.
     * @param {Speaker} speaker - A speaker.
     */
    constructor(renderer, keyboard, speaker) {
        this.renderer = renderer;
        this.keyboard = keyboard;
        this.speaker = speaker;

        /** 4K memory address space. */
        this.memory = newUint8Array(4096);

        /** Array of 16 8-bit registers. VF is typically reserved for flags. */
        this.v = new Uint8Array(16);

        /** 
         * 16-bit memory address pointer. In practice, only the first
         * 12 bits are actually used.
         */
        this.i = 0;

        // Timers
        this.delayTimer = 0;
        this.soundTimer = 0;

        /** 
         * Program counter register. Default value points to the first
         * non-reserved address in memory. 
         */ 
        this.pc = 0x200;

        /** Stack growing from the top of address space. */
        this.stack = new Array();

        /** Flag for whether execution is paused. */
        this.paused = false;

        /** Number of instructions executed per CPU Cycle. */
        this.speed = 10;
    }

    
    /**
     * Load sprites into memory.
     *
     * According to the spec, the sprites are stored in memory at addresses
     * 0x000 through 0x1FF. Each sprite consists of 5 bytes, of which there
     * are 16.
     */
    loadSpritesIntoMemory() {
        // All of the sprites for Chip-8 as given in the spec.
        const sprites = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];

        for (let i = 0; i < sprites.length; i++) {
            this.memory[i] = sprites[i]
        }
    }

    /**
     * Load a program into memory just after the reserved address space.
     *
     * @param {Uint8Array} program - A program ROM.
     */
    loadProgramIntoMemory(program) {
        for (let loc = 0; loc < program.length; loc++) {
            this.memory[OFFSET + loc] = program[loc]
        }
    }

    /**
     * Load a program ROM from the file system asynchronously.
     *
     * @param {String} romName - A rom to load.
     */
    loadRom(romName) {
        var request = new XMLHttpRequest;
        var self = this;

        request.onload = function() {
            if (request.response) {
                // Store ROM in a byte array and load.
                let program = new Uint8Array(request.response);

                self.loadProgramIntoMemory(program);
            }
        }

        request.open("GET", "roms/" + romName);
        request.responseType = "arraybuffer";

        request.send();
    }
    
    cycle() {
        for (let i = 0; i < this.speed; i++) {
            if (!this.paused) {
                /* Combine instruction opcode bytes */
                let op = (this.memory[this.pc] << 8 | this.memory[this.pc + 1]);
                this.execute(op);
            }
        }

        if (!this.paused) {
            this.updateTimers();
        }

        this.playSound();
        this.renderer.render();
    }

    updateTimers() {
        if (this.delayTimer > 0) {
            this.delayTimer -= 1;
        }

        if (this.soundTimer > 0) {
            this.soundTimer -= 1;
        }
    }

    /**
     * Play sound if the sound timer is running.
     */
    playSound() {
        if (this.soundTimer > 0) {
            this.speaker.play(440);
        } else {
            this.speaker.stop();
        }
    }

    execute(op) {
        // Increment the PC now that the current instruction has been read.
        this.pc += 2

        let x = (op & 0x0F00) >> 8
        let y = (op & 0x00F0) >> 4
        let kk = (op & 0x00FF)
        let nnn = (op & 0x0FFF)
        let n = (op & 0x000F)

        switch (opcode & 0xF000) {
            case 0x0000:
                switch (opcode) {
                    case 0x00E0:
                        break;
                    case 0x00EE:
                        break;
                }

                break;
            case 0x1000:
                break;
            case 0x2000:
                break;
            case 0x3000:
                break;
            case 0x4000:
                break;
            case 0x5000:
                break;
            case 0x6000:
                break;
            case 0x7000:
                break;
            case 0x8000:
                switch (opcode & 0xF) {
                    case 0x0:
                        break;
                    case 0x1:
                        break;
                    case 0x2:
                        break;
                    case 0x3:
                        break;
                    case 0x4:
                        break;
                    case 0x5:
                        break;
                    case 0x6:
                        break;
                    case 0x7:
                        break;
                    case 0xE:
                        break;
                }

                break;
            case 0x9000:
                break;
            case 0xA000:
                break;
            case 0xB000:
                break;
            case 0xC000:
                break;
            case 0xD000:
                break;
            case 0xE000:
                switch (opcode & 0xFF) {
                    case 0x9E:
                        break;
                    case 0xA1:
                        break;
                }

                break;
            case 0xF000:
                switch (opcode & 0xFF) {
                    case 0x07:
                        break;
                    case 0x0A:
                        break;
                    case 0x15:
                        break;
                    case 0x18:
                        break;
                    case 0x1E:
                        break;
                    case 0x29:
                        break;
                    case 0x33:
                        break;
                    case 0x55:
                        break;
                    case 0x65:
                        break;
                }

                break;

            default:
                throw new Error('Unknown opcode ' + opcode);
        }

    }
}

export default CPU;
