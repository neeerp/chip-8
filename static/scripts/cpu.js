const OFFSET = 0x200;
const U8_UB = 0x10;

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
        this.memory = new Uint8Array(4096);

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

        switch (op & 0xF000) {
            case 0x0000:
                switch (op) {
                    case 0x00E0:    // CLS
                        // Clear the screen
                        this.renderer.clear();
                        break;
                    case 0x00EE:    // RET
                        // Return from a subroutine using the address at the top
                        // of the stack.
                        this.pc = this.stack.pop();
                        break;
                }

                break;
            case 0x1000:            // JP addr
                // Jump to addr
                this.pc = nnn;
                break;
            case 0x2000:            // CALL addr
                // Put current pc on stack and jump to addr
                this.stack.push(this.pc);
                this.pc = nnn;
                break;
            case 0x3000:            // SE Vx, byte
                // Skip next instruction if register Vx == kk
                if (this.v[x] == kk) {
                    this.pc += 2;
                }
                break;
            case 0x4000:            // SNE Vx, byte
                // Skip next instruction if register Vx != kk
                if (this.v[x] != kk) {
                    this.pc += 2;
                }
                break;
            case 0x5000:            // SE Vx, Vy
                // Skip next instruction if register Vx == register Vy
                if (this.v[x] == this.v[y]) {
                    this.pc += 2;
                }
                break;
            case 0x6000:            // LD Vx, byte
                // Load kk into register Vx
                this.v[x] = kk;
                break;
            case 0x7000:            // ADD Vx, byte
                // Add value kk to register Vx and store the result in Vx
                this.v[x] += kk;
                break;
            case 0x8000:
                // Register to register ops
                switch (op & 0xF) {
                    case 0x0:       // LD Vx Vy
                        // Load value of Vy into Vx
                        this.v[x] = this.v[y];
                        break;
                    case 0x1:       // OR Vx Vy
                        // Set Vx to Vx OR Vy
                        this.v[x] |= this.v[y];
                        break;
                    case 0x2:       // AND Vx Vy
                        this.v[x] &= this.v[y];
                        break;
                    case 0x3:       // XOR Vx Vy
                        this.v[x] ^= this.v[y];
                        break;
                    case 0x4:       // ADD Vx Vy
                        let s = this.v[x] + this.v[y];
                        this.v[x] = s & 0xF;
                        this.v[0xF] = s & 0xF0;
                        break;
                    case 0x5:       // SUB Vx Vy
                        this.v[0xF] = this.v[x] > this.v[y] ? 1 : 0;
                        this.v[x] = this.v[x] - this.v[y];
                        break;
                    case 0x6:       // SHR Vx {, Vy}
                        // Shift Vx right one bit
                        this.v[0xF] = this.v[x] & 0x1;
                        this.v[x] >>= 1;
                        break;
                    case 0x7:       // SUBN Vx, Vy
                        // Vx = Vy - Vx
                        this.v[0xF] = this.v[y] > this.v[x] ? 1 : 0;
                        this.v[x] = this.v[y] - this.v[x];
                        break;
                    case 0xE:       // SHL Vx {, Vy}
                        // Shift Vx left
                        this.v[0xF] = this.v[x] & 0x80;
                        this.v[x] <<= 1;
                        break;
                }

                break;
            case 0x9000:            // SNE Vx, Vy
                // Skip the next instruction if Vx != Vy
                if (this.v[x] != this.v[y]) {
                    this.pc += 2;
                }
                break;
            case 0xA000:            // LD I, addr
                // Set the I register to address nnn
                this.i = nnn;
                break;
            case 0xB000:            // JP V0, addr
                // Jump to (nnn + V0)
                this.pc = nnn + this.v[0];
                break;
            case 0xC000:            // RND Vx, byte
                // Set Vx = random byte AND kk
                this.v[x] = kk & Math.floor(Math.random() * 0xFF);
                break;
            case 0xD000:            // DRW Vx, Vy, nibble
                // Display n-byte sprite starting at memory location I at position
                // (Vx, Vy); set VF = collision.
                //
                // Note: Sprites are 5xn pixels.
                //

                for (let i = 0; i < n; i++) {
                    let sprite = this.memory[this.i + i];
                    for (let j = 0; j < 8; j++) {
                        if (sprite & 0x80) {
                            this.v[0xF] |= this.renderer.setPixel(this.v[x] + j, this.v[y] + i)
                        }
                        sprite <<= 1;
                    }
                }

                break;
            case 0xE000:
                switch (op & 0xFF) {
                    case 0x9E:      // SKP Vx
                        // Skips the next instruction if the given key is being
                        // pressed.
                        if (this.keyboard.isKeyPressed(this.v[x])) {
                            this.pc += 2
                        }
                        break;
                    case 0xA1:      // SKNP
                        // Skip the next instruction if the given key is not
                        // being pressed.
                        if (!this.keyboard.isKeyPressed(this.v[x])) {
                            this.pc += 2;
                        }
                        break;
                }
                break;
            case 0xF000:
                switch (op & 0xFF) {
                    case 0x07:      // LD Vx DT
                        // Set Vx to the delay timer
                        this.v[x] = this.delayTimer;
                        break;
                    case 0x0A:      // LD Vx K
                        // Wait for a keypress and store the value in Vx.
                        // This pauses the program until a key is pressed.
                        
                        this.paused = true;
                        this.keyboard.onNextKeyPress = (key) => {
                            this.v[x] = key;
                            this.paused = false;
                        };

                        break;
                    case 0x15:      // LD DT, Vx
                        // Set the delay timer
                        this.delayTimer = this.v[x];
                        break;
                    case 0x18:      // LD ST, Vx
                        // Set the sound timer
                        this.soundTimer = this.v[x];
                        break;
                    case 0x1E:      // ADD I, Vx
                        // Set I = I + Vx
                        this.i += this.v[x];
                        break;
                    case 0x29:      // LD F, Vx
                        // Set I = location of sprite for digit Vx
                        this.i = this.v[x] * 5;
                        break;
                    case 0x33:      // LD B, Vx
                        // Taking the DECIMAL value of Vx, store..
                        // I <- hundreds digit
                        // I + 1 <- tens digit
                        // I + 2 <- 1s digit

                        this.memory[this.i] = parseInt(this.v[x] / 100);
                        this.memory[this.i + 1] = parseInt((this.v[x] % 100) / 10);
                        this.memory[this.i + 2] = parseInt(this.v[x] % 10);
                        break;
                    case 0x55:      // LD [I], Vx
                        // Store registers V0 through Vx in memory at location I
                        for (let i = 0; i <= x; i++) {
                            this.memory[this.i + i] = this.v[i];
                        }
                        break;
                    case 0x65:      // LD Vx [I]
                        // Store into registers V0 through Vx the data in memory
                        // starting at location I
                        for (let i = 0; i <= x; i++) {
                            this.v[i] = this.memory[this.i + i];
                        }

                        break;
                }

                break;

            default:
                throw new Error('Unknown opcode ' + op);
        }

    }
}

export default CPU;
