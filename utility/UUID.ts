

    export class UUID {

        private static _instance: UUID = new UUID();

        public static getInstance(): UUID {
            if (!UUID._instance) {
                UUID._instance = new UUID();
            }
            return UUID._instance;
        }

        private constructor() {

        }
        private hex(num:number, length:number) { // _hexAligner
            var str = num.toString(16), i = length - str.length, z = "0";
            for (; i > 0; i >>>= 1, z += z) { if (i & 1) { str = z + str; } }
            return str;
        }



        private rand(x:number) {  // _getRandomInt
            if (x < 0) return NaN;
            if (x <= 30) return (0 | Math.random() * (1 << x));
            if (x <= 53) return (0 | Math.random() * (1 << 30))
                + (0 | Math.random() * (1 << x - 30)) * (1 << 30);
            return NaN;
        }

        public hexNoDelim() {

            return this.hex(this.rand(32), 8)          // time_low

                + this.hex(this.rand(16), 4)          // time_mid

                + this.hex(0x4000 | this.rand(12), 4) // time_hi_and_version

                + this.hex(0x8000 | this.rand(14), 4) // clock_seq_hi_and_reserved clock_seq_low

                + this.hex(this.rand(48), 12);        // node
        }

        public generate() {
            return this.hex(this.rand(32), 8)          // time_low
                + "-"
                + this.hex(this.rand(16), 4)          // time_mid
                + "-"
                + this.hex(0x4000 | this.rand(12), 4) // time_hi_and_version
                + "-"
                + this.hex(0x8000 | this.rand(14), 4) // clock_seq_hi_and_reserved clock_seq_low
                + "-"
                + this.hex(this.rand(48), 12);        // node
        }
    }

