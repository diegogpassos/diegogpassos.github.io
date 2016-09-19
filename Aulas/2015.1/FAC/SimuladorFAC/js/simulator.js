function Simulator(initialPC, freq) {

    /*
     * Single control lines.
     */

    this.ControlOutput = Object({
        Branch      : false,
        MemToReg    : false,
        MemRead     : false,
        MemWrite    : false,
        ALUOp0      : false,
        ALUOp1      : false,
        ALUSrc      : false,
        RegWrite    : false,
        RegDest     : false,
        Jump        : false
    });

    this.ALUOutput = Object({
        Zero        : false,
        Result      : 0
    });

    this.ALUControlOutput = Object({
        Bit0        : false,
        Bit1        : false,
        Bit2        : false,
        Bit3        : false
    });

    this.RegisterBankOutput = Object({
        Value0      : 0,
        Value1      : 0
    });

    this.BranchANDGateOutput = false;

    /*
     * Sets of lines (usually 32 bits numbers).
     */

    this.SignalExtensionOutput = 0;

    this.PCIncrementerOutput = 0;

    this.JumpOffsetCombinerOutput = 0;

    this.BranchOffsetAdderOutput = 0;

    this.DataMemoryOutput = 0;

    /*
     * Instruction Register. Although its value is
     * stored outside this classe, we cache and split
     * its value in order to save time and complexity.
     */
    this.IROutput = Object({
        RI_5_0      : "000000",
        RI_15_0     : "0000000000000000",
        RI_15_11    : "00000",
        RI_20_16    : "00000",
        RI_25_21    : "00000",
        RI_31_26    : "000000",
        RI_25_0     : "000000000000000000000000"
    });

    /*
     * PC: same as above.
     */
    this.PCOutput = initialPC; // 32 bits.

    /*
     * Multiplexers.
     */

    this.ToRegisterDataMuxOutput = 0; // 32 bits.

    this.ToRegisterSelectorMuxOutput = "00000"; // 5 bits.

    this.ToALUMuxOutput = 0; // 32 bits.

    this.ToPCMUX1Output = 0; // 32 bits.

    this.ToPCMUX2Output = 0; // 32 bits.

    /*
     * Shifters.
     */

    this.JumpOffsetShifterOutput = 0;

    this.BranchOffsetShifterOutput = 0;


    /*
     * Other values.
     */
    this.freq = freq;  // In Hz.

    /*
     * Timer object used for repeating the execution cycle.
     */
    this.timer = null;

    this.filterInvalidCodes = true; // Use aditional tests to find out invalid opcodes and functions?

    /*
     * Function that should be called in case of an exception happening during the execution.
     */
    this.exceptionCallback = "";

    /*
     * Component to be inspected by the user.
     */
    this.inspectedComponent = "";

    /*
     * Array of cells (memory or registers) that had their
     * background colors modified in the last cycle.
     */
    this.toClearColor = [];
}

/*
 * Methods that represent components in the processor.
 * Each component reads its input values and updates its
 * outputs (stored as properties of the Processor class).
 */

Simulator.prototype.PC = function() {

    /*
     * Input: ToPCMUX2Output.
     * Output: PCOutput.
     * Notes: also updates the PC field on the 
     * register table on the interface.
     */

    /*
     * Internal to the class.
     */
    this.PCOutput = this.ToPCMUX2Output;

    /*
     * To interface.
     */
    var PCTableEntry = document.getElementById('regPC');
    PCTableEntry.innerHTML = completeWithLeftZeros(this.PCOutput.toString(16).toUpperCase(), 8);

    return(0);
}

Simulator.prototype.IR = function() {

    /*
     * Input: PCOutput.
     * Output: 
     *  -IROutput.RI_5_0
     *  -IROutput.RI_15_0
     *  -IROutput.RI_15_11
     *  -IROutput.RI_20_16
     *  -IROutput.RI_25_21
     *  -IROutput.RI_31_26
     *  -IROutput.RI_25_0
     * Notes: also updates the RI field on the
     * register table on the interface.
     */

    /*
     * First, read the memory position point by PC.
     * Be careful, the size of a instruction is hardcoded here.
     */
    var word = this.readWord(this.PCOutput);

    /*
     * Now, we convert the word into bits.
     */
    var bits = completeWithLeftZeros(parseInt(word, 16).toString(2), 32);
    
    /*
     * Now, we split the bits into the output sets.
     * Be careful, the 31st bit is represented by the 0th character.
     */
    this.IROutput.RI_31_26 = bits.substring(0, 6);
    this.IROutput.RI_25_21 = bits.substring(6, 11);
    this.IROutput.RI_20_16 = bits.substring(11, 16);
    this.IROutput.RI_15_11 = bits.substring(16, 21);
    this.IROutput.RI_5_0 = bits.substring(26, 32);
    this.IROutput.RI_15_0 = bits.substring(16, 32);
    this.IROutput.RI_25_0 = bits.substring(6, 32);

    /*
     * Finally, update the register table.
     */
    var IRTableEntry = document.getElementById('regRI');

    IRTableEntry.innerHTML = completeWithLeftZeros(bits, 32);

    return(0);
}

Simulator.prototype.Control = function() {

    /*
     * Input: IROutput.RI_31_26.
     * Output: 
     *  - ControlOutput.Branch
     *  - ControlOutput.MemToReg
     *  - ControlOutput.MemRead
     *  - ControlOutput.MemWrite
     *  - ControlOutput.ALUOp0
     *  - ControlOutput.ALUOp1
     *  - ControlOutput.ALUSrc
     *  - ControlOutput.RegWrite
     *  - ControlOutput.RegDest
     *  - ControlOutput.Jump
     */
    var Op = this.IROutput.RI_31_26.split("");

    /*
     * Be careful, the indexes here are inverted with respect to
     * the logic used by Patterson (e.g., Op[3] = Op2).
     */
    this.ControlOutput.Branch = (Op[3] == '1');
    this.ControlOutput.MemToReg = (Op[0] == '1') && (Op[2] == '0');
    this.ControlOutput.MemRead = (Op[0] == '1') && (Op[2] == '0');
    this.ControlOutput.MemWrite = (Op[0] == '1') && (Op[2] == '1');
    this.ControlOutput.ALUOp0 = (Op[3] == '1');
    this.ControlOutput.ALUOp1 = (Op[4] == '0') && (Op[3] == '0') && (Op[2] == '0');
    this.ControlOutput.ALUSrc = (Op[0] == '1') || (Op[2] == '1');
    this.ControlOutput.RegWrite = ((Op[2] == '1') && (Op[0] == '0')) || ((Op[0] == '1') && (Op[2] == '0')) || ((Op[4] == '0') && (Op[3] == '0') && (Op[2] == '0'));
    this.ControlOutput.RegDest = ((Op[4] == '0') && (Op[3] == '0') && (Op[2] == '0'));
    this.ControlOutput.Jump = (Op[4] == '1') && (Op[0] == '0');

    /*
     * The above logic assumes that all instructions are valid.
     * In practice, since we do not implement the complete set of
     * instructions, we might receive an invalid opcode. We will, 
     * optionally, test this condition.
     */
    if (this.filterInvalidCodes) {

        switch(this.IROutput.RI_31_26) {

            case "000000":
            case "000010":
            case "000100":
            case "001000":
            case "100011":
            case "101011":
                
                break ;

            default:
                
                alert("Instrução com opcode inválido: " + this.IROutput.RI_31_26 + "!");
                return(-1);
        }
    }

    return(0);
}

Simulator.prototype.ALU = function() {

    /*
     * Meaning of the control lines:
     *  - 0000: and.
     *  - 0001: or.
     *  - 0010: add.
     *  - 0110: subtract.
     *  - 0111: set on less than.
     *  - 1100: nor.
     */

    /*
     * Input: 
     *  - ALUControlOutput.Bit0
     *  - ALUControlOutput.Bit1
     *  - ALUControlOutput.Bit2
     *  - ALUControlOutput.Bit3
     *  - RegisterBankOutput.Value0
     *  - ToALUMuxOutput
     * Output: 
     *  - ALUOutput.Zero
     *  - ALUOutput.Result
     * Note: We assume Bit0 is the leftmost.
     */
//alert('RegisterBankOutput.Value0 = ' + this.RegisterBankOutput.Value0 + ', ToALUMuxOutput = ' + this.ToALUMuxOutput);
    if (!this.ALUControlOutput.Bit0 && !this.ALUControlOutput.Bit1 && !this.ALUControlOutput.Bit2 && !this.ALUControlOutput.Bit3) {

        /*
         * Bitwise and.
         */

        this.ALUOutput.Result = (+this.RegisterBankOutput.Value0) & (+this.ToALUMuxOutput);

        /*
         * Be careful, when performing bitwise operations, javascript converts 
         * numerical types to 32-bit signed integers and the actual value back to
         * the usual numerical format. This means that a bitwise logical operation 
         * may result in a negative numerical type. Since we only work with positive
         * javascript numerical types, we have to check and correct this condition.
         * Basically, we test if the number is negative. In this case, we flit its sign
         * and compute its two's complement.
         */
        if (this.ALUOutput.Result < 0) this.ALUOutput.Result = twoComplement(-this.ALUOutput.Result, 32);
    }
    else if (!this.ALUControlOutput.Bit0 && !this.ALUControlOutput.Bit1 && !this.ALUControlOutput.Bit2 && this.ALUControlOutput.Bit3) {

        /*
         * Bitwise or.
         */

        this.ALUOutput.Result = (+this.RegisterBankOutput.Value0) | (+this.ToALUMuxOutput);

        /*
         * See above comment for the bitwise and.
         */

        if (this.ALUOutput.Result < 0) this.ALUOutput.Result = twoComplement(-this.ALUOutput.Result, 32);
    }
    else if (!this.ALUControlOutput.Bit0 && !this.ALUControlOutput.Bit1 && this.ALUControlOutput.Bit2 && !this.ALUControlOutput.Bit3) {

        /*
         * Addition.
         */

        this.ALUOutput.Result = (+this.RegisterBankOutput.Value0) + (+this.ToALUMuxOutput);

        /*
         * Javascript uses double precision float points to represent integers.
         * Therefore, summing two numbers that would generate a carry on the 33rd bit
         * might produce undesirable results. We must make sure we correct that.
         */

        this.ALUOutput.Result = this.ALUOutput.Result % 4294967296;
    }
    else if (!this.ALUControlOutput.Bit0 && this.ALUControlOutput.Bit1 && this.ALUControlOutput.Bit2 && !this.ALUControlOutput.Bit3) {

        /*
         * Subtraction. We must be extra careful here, because, so far, we've 
         * dealt with numbers as if they were always positive. Since the simulated
         * processor uses Two's complement, subtracting two numbers requires us to 
         * two complement the second operator and then to perform an addition.
         */

        this.ALUOutput.Result = (+this.RegisterBankOutput.Value0) + (twoComplement(+this.ToALUMuxOutput, 32));

//alert("ALUOutput.Result(1) = " + this.ALUOutput.Result);
        /*
         * As with the sum, we have to get rid of possible overflows.
         */

        this.ALUOutput.Result = this.ALUOutput.Result % 4294967296;
//alert("ALUOutput.Result(2) = " + this.ALUOutput.Result);
    }
    else if (!this.ALUControlOutput.Bit0 && this.ALUControlOutput.Bit1 && this.ALUControlOutput.Bit2 && this.ALUControlOutput.Bit3) {

        /*
         * Set on less than. Possibly the most complicated operation. This operation 
         * is signed, so we must first check the leftmost bit of the numbers.
         */

        if ((+this.ToALUMuxOutput) & 0x80000000) {

            if ((+this.RegisterBankOutput.Value0) & 0x80000000) {

                /*
                 * Both numbers are negative. We can just compare them as if they were postive.
                 */

                if ((+this.RegisterBankOutput.Value0) < (+this.ToALUMuxOutput)) this.ALUOutput.Result = 1;
                else this.ALUOutput.Result = 0;
            }
            else {

                /*
                 * The first operand is positive and the second is negative. Hence, the first is larger.
                 */
                this.ALUOutput.Result = 0;
            }
        }
        else {

            if ((+this.RegisterBankOutput.Value0) & 0x80000000) {

                /*
                 * The first operand is negative and the second is positive. Hence, the first is lower.
                 */
                this.ALUOutput.Result = 1;
            }
            else {

                /*
                 * Both numbers are positive. We can just compare them.
                 */

                if ((+this.RegisterBankOutput.Value0) < (+this.ToALUMuxOutput)) this.ALUOutput.Result = 1;
                else this.ALUOutput.Result = 0;
            }
        }
    }
    else if (!this.ALUControlOutput.Bit0 && this.ALUControlOutput.Bit1 && this.ALUControlOutput.Bit2 && !this.ALUControlOutput.Bit3) {

        /*
         * Bitwise nor.
         */

        this.ALUOutput.Result = ~((+this.RegisterBankOutput.Value0) | (+this.ToALUMuxOutput));

        /*
         * See above comment for the bitwise and.
         */

        if (this.ALUOutput.Result < 0) this.ALUOutput.Result = twoComplement(-this.ALUOutput.Result, 32);
    }
    else {

        /*
         * We should not have got here.
         */
        alert("Sinais de controle da ALU são inválidos!");
        return(-1);
    }

    this.ALUOutput.Zero = (this.ALUOutput.Result == 0);

//alert("ALUOutput.Result(3) = " + this.ALUOutput.Result);
//alert("ALUOutput.Zero = " + this.ALUOutput.Zero);
    return(0);
}

Simulator.prototype.ALUControl = function() {

    /*
     * Meaning of the control lines:
     *  - 00: add.
     *  - 10: sub.
     *  - 01: let the function field of the instruction define.
     *  - 11: not used.
     */

    /*
     * Input: 
     *  - IROutput.RI_5_0
     *  - ControlOutput.ALUOp0
     *  - ControlOutput.ALUOp1
     * Output: 
     *  - ALUControlOutput.Bit0
     *  - ALUControlOutput.Bit1
     *  - ALUControlOutput.Bit2
     *  - ALUControlOutput.Bit3
     * Note: We assume ALUOp0 and Bit0 are the leftmost.
     */
 
    if (!this.ControlOutput.ALUOp0 && !this.ControlOutput.ALUOp1) {

        /*
         * Addition.
         */
        this.ALUControlOutput.Bit0 = false;
        this.ALUControlOutput.Bit1 = false;
        this.ALUControlOutput.Bit2 = true;
        this.ALUControlOutput.Bit3 = false;
    }
    else if (this.ControlOutput.ALUOp0 && !this.ControlOutput.ALUOp1) {

        /*
         * Subtraction.
         */
        this.ALUControlOutput.Bit0 = false;
        this.ALUControlOutput.Bit1 = true;
        this.ALUControlOutput.Bit2 = true;
        this.ALUControlOutput.Bit3 = false;
    }
    else if (!this.ControlOutput.ALUOp0 && this.ControlOutput.ALUOp1) {

        /*
         * Let function decide. Possible values for function:
         *  - 100100: and.
         *  - 100101: or.
         *  - 100000: add.
         *  - 100010: subtract.
         *  - 101010: set on less than.
         * Correspondent outputs:
         *  - 0000: and.
         *  - 0001: or.
         *  - 0010: add.
         *  - 0110: subtract.
         *  - 0111: set on less than.
         */
        var func = this.IROutput.RI_5_0.split("");

        /*
         * Leftmost bit is always 0.
         */
        this.ALUControlOutput.Bit0 = false;

        /*
         * Second bit is determined by second to last 
         * bit of function.
         */
        this.ALUControlOutput.Bit1 = (func[4] == '1');

        /*
         * Third bit is one if fourth bit from function
         * is zero.
         */
        this.ALUControlOutput.Bit2 = (func[3] == '0');

        /*
         * Last bit is more complicated.
         */
        this.ALUControlOutput.Bit3 = (func[2] == '1') || (func[5] == '1');

        /*
         * The above logic assumes that all instructions are valid.
         * In practice, since we do not implement the complete set of
         * instructions, we might receive an invalid function code. We will, 
         * optionally, test this condition.
         */
        if (this.filterInvalidCodes) {

            switch(this.IROutput.RI_5_0) {

                case "100100":
                case "100101":
                case "100000":
                case "100010":
                case "101010":
                    
                    break ;

                default:
                    
                    alert("Instrução com campo função inválido: " + this.IROutput.RI_5_0 + "!");
                    return(-1);
            }
        }
    }
    else if (!this.ControlOutput.ALUOp0 && !this.ControlOutput.ALUOp1) {

        /*
         * Unused. We should not have got here.
         */

        alert("Controle da ALU chegou a um estado inválido!");
        return(-1);
    }

    return(0);
}

/*
 * Although the register bank is viewed as a single component,
 * it actually performs two different tasks at two different moments:
 * it first perform read operations and then (after the ALU and data memory
 * components have acted) it performs a write.
 */
Simulator.prototype.RegisterBankRead = function() {

    /*
     * Input: 
     *  - IROutput.RI_25_21
     *  - IROutput.RI_20_16
     * Output: 
     *  - RegisterBankOutput.Value0
     *  - RegisterBankOutput.Value1
     */
 
    /*
     * The register bank always performs reads 
     * (even if they are discarded by other components later).
     * We start with the first read, determined by IROutput.RI_25_21.
     * Remember, it's a string containing the binary representation.
     * The id, on the other hand, is also a string, but with a decimal
     * representation using two digits.
     */
    var readRegId = completeWithLeftZeros(parseInt(this.IROutput.RI_25_21, 2).toString(10), 2);
    var RegTableEntry = document.getElementById('reg' + readRegId);

    /* 
     * Now, the register values stored in the interface table are also
     * strings in hex. Our output must be a javascript integer.
     */
    this.RegisterBankOutput.Value0 = parseInt(RegTableEntry.innerHTML, 16);

    RegTableEntry.style.backgroundColor = "#8C8";
    this.toClearColor[this.toClearColor.length] = RegTableEntry;

    /*
     * To the second read now.
     */
    readRegId = completeWithLeftZeros(parseInt(this.IROutput.RI_20_16, 2).toString(10), 2);
    RegTableEntry = document.getElementById('reg' + readRegId);
    this.RegisterBankOutput.Value1 = parseInt(RegTableEntry.innerHTML, 16);

    RegTableEntry.style.backgroundColor = "#8C8";
    this.toClearColor[this.toClearColor.length] = RegTableEntry;

    return(0);
}


Simulator.prototype.RegisterBankWrite = function() {

    /*
     * Input: 
     *  - ControlOutput.RegWrite
     *  - ToRegisterDataMuxOutput
     *  - ToRegisterSelectorMuxOutput
     * Notes: may also update the registers on the
     * register table on the interface.
     */
 
    /*
     * Writes are controled by ControlOutput.RegWrite.
     */
    if (this.ControlOutput.RegWrite) {

        /*
         * Operation is similar to the reads.
         */

        var writeRegId = completeWithLeftZeros(parseInt(this.ToRegisterSelectorMuxOutput, 2).toString(10), 2);
        var RegTableEntry = document.getElementById('reg' + writeRegId);
            
        /*
         * But in this case, we must convert a java numeric type to a string
         * with a hex representation with 8 digits.
         */
        RegTableEntry.innerHTML = completeWithLeftZeros(this.ToRegisterDataMuxOutput.toString(16).toUpperCase(), 8);

        if (RegTableEntry.style.backgroundColor == "") 
            RegTableEntry.style.backgroundColor = "#C88";
        else            
            RegTableEntry.style.backgroundColor = "#FF8";

        this.toClearColor[this.toClearColor.length] = RegTableEntry;
    }

    return(0);
}

Simulator.prototype.BranchANDGate = function() {

    /*
     * Input: 
     *  - ControlOutput.Branch
     *  - ALUOutput.Zero
     * Output: 
     *  - BranchANDGateOutput
     */
 
    this.BranchANDGateOutput = this.ControlOutput.Branch && this.ALUOutput.Zero;

    return(0);
}

Simulator.prototype.SignalExtension = function() {

    /*
     * Input: 
     *  - IROutput.RI_15_0
     * Output: 
     *  - SignalExtensionOutput
     */
 
    /*
     * We only have to be careful to extend the signal bit correctly.
     */
    if (this.IROutput.RI_15_0.charAt(0) == '0') 
        this.SignalExtensionOutput = completeWithLeftZeros(this.IROutput.RI_15_0, 32);
    else
        this.SignalExtensionOutput = completeWithLeftOnes(this.IROutput.RI_15_0, 32);

    this.SignalExtensionOutput = parseInt(this.SignalExtensionOutput, 2);

    return(0);
}


Simulator.prototype.RegisterBank = function() {

    /*
     * Input: 
     *  - ControlOutput.RegWrite
     *  - IROutput.RI_25_21
     *  - IROutput.RI_20_16
     *  - ToRegisterDataMuxOutput
     *  - ToRegisterSelectorMuxOutput
     * Output: 
     *  - RegisterBankOutput.Value0
     *  - RegisterBankOutput.Value1
     * Notes: may also update the registers on the
     * register table on the interface.
     */
 
    /*
     * The register bank always performs reads 
     * (even if they are discarded by other components later).
     * We start with the first read, determined by IROutput.RI_25_21.
     * Remember, it's a string containing the binary representation.
     * The id, on the other hand, is also a string, but with a decimal
     * representation using two digits.
     */
    var readRegId = completeWithLeftZeros(parseInt(this.IROutput.RI_25_21, 2).toString(10), 2);
    var RegTableEntry = document.getElementById('reg' + readRegId);

    /* 
     * Now, the register values stored in the interface table are also
     * strings in hex. Our output must be a javascript integer.
     */
    this.RegisterBankOutput.Value0 = parseInt(RegTableEntry.innerHTML, 16);

    /*
     * To the second read now.
     */
    readRegId = completeWithLeftZeros(parseInt(this.IROutput.RI_20_16, 2).toString(10), 2);
    RegTableEntry = document.getElementById('reg' + readRegId);
    this.RegisterBankOutput.Value1 = parseInt(RegTableEntry.innerHTML, 16);

    /*
     * Writes are controled by ControlOutput.RegWrite.
     */
    if (this.ControlOutput.RegWrite) {

        /*
         * Operation is similar to the reads.
         */

        var writeRegId = completeWithLeftZeros(parseInt(this.ToRegisterSelectorMuxOutput, 2).toString(10), 2);
        RegTableEntry = document.getElementById('reg' + writeRegId);
            
        /*
         * But in this case, we must convert a java numeric type to a string
         * with a hex representation with 8 digits.
         */
        RegTableEntry.innerHTML = completeWithLeftZeros(this.ToRegisterDataMuxOutput.toString(16).toUpperCase(), 8);
    }

    return(0);
}

Simulator.prototype.PCIncrementer = function() {

    /*
     * Input: 
     *  - PCOutput
     * Output: 
     *  - PCIncrementerOutput
     */
 
    /*
     * We only have to be careful with overflow. Works like a normal sum 
     * in the ALU. We always sum PC + 4.
     */

    this.PCIncrementerOutput = (this.PCOutput + 4) % 4294967296;
    
    return(0);
}

Simulator.prototype.JumpOffsetShifter = function() {

    /*
     * Input:
     *  - IROutput.RI_25_0
     * Output:
     *  - JumpOffsetShifterOutput
     */

    /*
     * It's a shift left by two positions, which means we can multipliy by 4.
     * Notice there is never overflow because the RI output is only 26 bits wide.
     * Also, notice that IROutput.RI_25_0 is a string with a binary representation.
     * We must convert it to a javascript numeric type.
     */

    this.JumpOffsetShifterOutput = parseInt(this.IROutput.RI_25_0, 2) * 4;

    return(0);
}

Simulator.prototype.BranchOffsetShifter = function() {

    /*
     * Input:
     *  - SignalExtensionOutput
     * Output:
     *  - BranchOffsetShifterOutput
     */

    /*
     * Very similar to JumpOffsetShifter, but since SignalExtension 
     * generates a 32-bit value, there can be overflow. We have to 
     * mask it to 32-bits again. Also notice that the SignalExtension
     * generates a javascript numeric type, instead of a string.
     */

    this.BranchOffsetShifterOutput = (this.SignalExtensionOutput * 4) % 4294967296;

    return(0);
}

Simulator.prototype.JumpOffsetCombiner = function() {

    /*
     * Input:
     *  - JumpOffsetShifterOutput
     *  - PCIncrementerOutput
     * Output:
     *  - JumpOffsetCombinerOutput
     */

    /*
     * Basically, we take the four most significant bits from PCIncrementerOutput,
     * and the 28 least significant bits form JumpOffsetShifterOutput and concatenate
     * them. Since both are positive numeric javascript types, we can do that simply 
     * with bitwise operations and a sum.
     */

    this.JumpOffsetCombinerOutput = this.JumpOffsetShifterOutput + (0xF0000000 & this.PCIncrementerOutput);

    return(0);
}

Simulator.prototype.BranchOffsetAdder = function() {

    /*
     * Input: 
     *  - BranchOffsetShifterOutput
     *  - PCIncrementerOutput
     * Output: 
     *  - BranchOffsetAdderOutput
     */
 
    /*
     * Again, we only have to be careful with overflow. Works like a normal sum 
     * in the ALU.
     */

    this.BranchOffsetAdderOutput = (this.PCIncrementerOutput + this.BranchOffsetShifterOutput) % 4294967296;

    return(0);
}

Simulator.prototype.DataMemory = function() {

    /*
     * Input: 
     *  - ALUOutput.Result
     *  - RegisterBankOutput.Value1
     *  - ControlOutput.MemRead
     *  - ControlOutput.MemWrite
     * Output: 
     *  - DataMemoryOutput
     */
    
    var ret;
//alert('DataMemory.Inputs: ALUOutput.Result = ' + this.ALUOutput.Result + ', ControlOutput.MemRead = ' + this.ControlOutput.MemRead);     
    /*
     * Differently from the register bank, we only perform 
     * a read if we receive the correspondent signal.
     */
    if (this.ControlOutput.MemRead) {

        /*
         * Yes, we have to perform a read. The address is given
         * by ALUOutput.Result. We delegate the reading functionality
         * to the method readWord(). Notice that this method returns
         * a string in hex. We must convert it.
         * Also, the read method may return an error.
         */

        ret = this.readWord(this.ALUOutput.Result);
        if (ret == -1) return(-1);
//alert('DataMemory: raw read = ' + ret);
        this.DataMemoryOutput = parseInt(ret, 16);
    }

    /*
     * Do we have to execute a write?
     */
    if (this.ControlOutput.MemWrite) {

        /*
         * Yes. It's similar to the read operation.
         * The value to be written comes from RegisterBankOutput.Value1.
         */
        ret = this.writeWord(this.ALUOutput.Result, this.RegisterBankOutput.Value1);
        if (ret == -1) return(-1);
    }

    return(0);
}

Simulator.prototype.ToRegisterDataMux = function() {

    /*
     * Input: 
     *  - ALUOutput.Result
     *  - DataMemoryOutput
     *  - ControlOutput.MemToReg
     * Output: 
     *  - ToRegisterDataMuxOutput
     */
 
    if (this.ControlOutput.MemToReg) this.ToRegisterDataMuxOutput = this.DataMemoryOutput;
    else this.ToRegisterDataMuxOutput = this.ALUOutput.Result;

    return(0);
}

Simulator.prototype.ToRegisterSelectorMux = function() {

    /*
     * Input: 
     *  - IROutput.RI_15_11
     *  - IROutput.RI_20_16
     *  - ControlOutput.RegDest
     * Output: 
     *  - ToRegisterSelectorMuxOutput
     */
 
    if (this.ControlOutput.RegDest) this.ToRegisterSelectorMuxOutput = this.IROutput.RI_15_11;
    else this.ToRegisterSelectorMuxOutput = this.IROutput.RI_20_16;

    return(0);
}

Simulator.prototype.ToALUMux = function() {

    /*
     * Input: 
     *  - ControlOutput.ALUSrc
     *  - RegisterBankOutput.Value1
     *  - SignalExtensionOutput
     * Output: 
     *  - ToALUMuxOutput
     */
//alert('ControlOutput.ALUSrc = ' + this.ControlOutput.ALUSrc + ', RegisterBankOutput.Value1 = ' + this.RegisterBankOutput.Value1 + ', SignalExtensionOutput = ' + this.SignalExtensionOutput);
    if (this.ControlOutput.ALUSrc) this.ToALUMuxOutput = this.SignalExtensionOutput;
    else this.ToALUMuxOutput = this.RegisterBankOutput.Value1;

    return(0);
}

Simulator.prototype.ToPCMUX1 = function() {

    /*
     * Input: 
     *  - BranchANDGateOutput
     *  - BranchOffsetAdderOutput
     *  - PCIncrementerOutput
     * Output: 
     *  - ToPCMUX1Output
     */
 
    if (this.BranchANDGateOutput) this.ToPCMUX1Output = this.BranchOffsetAdderOutput;
    else this.ToPCMUX1Output = this.PCIncrementerOutput;

    return(0);
}

Simulator.prototype.ToPCMUX2 = function() {

    /*
     * Input: 
     *  - ControlOutput.Jump
     *  - ToPCMUX1Output
     *  - JumpOffsetCombinerOutput
     * Output: 
     *  - ToPCMUX2Output
     */
 
    if (this.ControlOutput.Jump) this.ToPCMUX2Output = this.JumpOffsetCombinerOutput;
    else this.ToPCMUX2Output = this.ToPCMUX1Output;

    return(0);
}

/*
 * Methods for handling the execution cycle.
 */

Simulator.prototype.clearBackgrounds = function() {

    for (var i = 0; i < this.toClearColor.length; i++) {

        var cell = this.toClearColor[i];
        cell.style.backgroundColor = "";
    }

    this.toClearColor.length = 0;
}

Simulator.prototype.executeCycle = function() {

    /*
     * With the behavior of each component defined,
     * all we have to do here is call each component
     * method sequentially in such an order that we
     * respect the dependencies (i.e., a component
     * can only be executed when its inputs are ready).
     * We only have to be careful because each of those
     * functions might return an error. In this case,
     * we must abort the cycle execution.
     */

    this.clearBackgrounds();

    /*
     * We start by the IR(), taking the value current held by PCOutput.
     * The cycle ends executing PC() to update this value.
     */
    if (this.IR() == -1) return(-1);
    if (this.Control() == -1) return(-1);
    if (this.ALUControl() == -1) return(-1);
    if (this.SignalExtension() == -1) return(-1);
    if (this.PCIncrementer() == -1) return(-1);
    if (this.JumpOffsetShifter() == -1) return(-1);
    if (this.BranchOffsetShifter() == -1) return(-1);
    if (this.JumpOffsetCombiner() == -1) return(-1);
    if (this.BranchOffsetAdder() == -1) return(-1);
    if (this.ToRegisterSelectorMux() == -1) return(-1);
    if (this.RegisterBankRead() == -1) return(-1);
    if (this.ToALUMux() == -1) return(-1);
    if (this.ALU() == -1) return(-1);
    if (this.BranchANDGate() == -1) return(-1);
    if (this.DataMemory() == -1) return(-1);
    if (this.ToRegisterDataMux() == -1) return(-1);
    if (this.RegisterBankWrite() == -1) return(-1);
    if (this.ToPCMUX1() == -1) return(-1);
    if (this.ToPCMUX2() == -1) return(-1);
    if (this.PC() == -1) return(-1);

    this.updateScreen();

    return(0);
}
 
Simulator.prototype.updateLine = function(svg, id, state) {

    var onStroke = "#282";
    var offStroke = "#000";
    var onStrokeWidth = "3px";
    var offStrokeWidth = "1px";
    var line;

    line = svg.getElementById(id);
    if (state) {
        
        line.style.stroke = onStroke;
        line.style.strokeWidth = onStrokeWidth;
    }
    else {

        line.style.stroke = offStroke;
        line.style.strokeWidth = offStrokeWidth;
    }
}

Simulator.prototype.updateScreen = function() {

    var i;
    var svg = document.getElementById('ProcessorImage').contentDocument;

    // Update lines from ControlOutput
    for (i in this.ControlOutput) {

        this.updateLine(svg, "ControlOutput" + i, this.ControlOutput[i]);
    }

    // Update zero output line from ALU.
    this.updateLine(svg, 'ALUOutputZero', this.ALUOutput.Zero);

    // Update lines from ALUControlOutput
    for (i in this.ALUControlOutput) {

        this.updateLine(svg, "ALUControlOutput" + i, this.ALUControlOutput[i]);
    }

    // Update BranchANDGate output
    this.updateLine(svg, 'BranchANDGateOutput', this.BranchANDGateOutput);

    // Update the inspection field of the interface.
    this.updateInspector();
}

Simulator.prototype.updateInspector = function(target) {

    if (this.inspectedComponent == "") return ;

    var InspectorBody = document.getElementById('InspectorBody');
    var string = "";

    switch(this.inspectedComponent) {

        case "ALU":
            string = "&nbsp;ALU: {Zero = " + (this.ALUOutput.Zero & 1) + ", Resultado = 0x" + completeWithLeftZeros(this.ALUOutput.Result.toString(16), 8) + "}";
            break ;
       case "InstructionMemory":
            var bits = this.IROutput.RI_31_26 + this.IROutput.RI_25_0;
            var hex = completeWithLeftZeros(parseInt(bits, 2).toString(16), 8);
            string = "&nbsp;Memória de Instruções: 0x" + hex;
            break ;
        case "PC":
            string = "&nbsp;PC: 0x" + completeWithLeftZeros(this.PCOutput.toString(16), 8);
            break ;
        case "RegisterBank":
            string = "&nbsp;Regs.: {S0 = 0x" + completeWithLeftZeros(this.RegisterBankOutput.Value0.toString(16), 8) + ", S1 = 0x" + completeWithLeftZeros(this.RegisterBankOutput.Value1.toString(16), 8) + "}"
            break ;
        case "BranchANDGate":
            string = "&nbsp;Porta AND: " + (this.BranchANDGateOutput & 1);
            break ;
        case "SignalExtension":
            string = "&nbsp;Extensão de Sinal: 0x" + completeWithLeftZeros(this.SignalExtensionOutput.toString(16), 8);
            break ;
        case "PCIncrementer":
            string = "&nbsp;Somador (PC): 0x" + completeWithLeftZeros(this.PCIncrementerOutput.toString(16), 8);
            break ;
        case "JumpOffsetCombiner":
            string = "&nbsp;Combinador do sinal de jump: 0x" + completeWithLeftZeros(this.JumpOffsetCombinerOutput.toString(16), 8);
            break ;
        case "JumpOffsetShifter":
            string = "&nbsp;Deslocador do sinal de jump: 0x" + completeWithLeftZeros(this.JumpOffsetCombinerOutput.toString(16), 8).substring(2, 8);
            break ;
        case "BranchOffsetAdder":
            string = "&nbsp;Somador (branch): 0x" + completeWithLeftZeros(this.BranchOffsetAdderOutput.toString(16), 8);
            break ;
        case "DataMemory":
            string = "&nbsp;Memória de Dados: 0x" + completeWithLeftZeros(this.DataMemoryOutput.toString(16), 8);
            break ;
        case "RI_5_0":
            string = "&nbsp;RI[5-0]: " + this.IROutput.RI_5_0;
            break ;
        case "RI_15_0":
            string = "&nbsp;RI[15-0]: " + this.IROutput.RI_15_0;
            break ;
        case "RI_15_11":
            string = "&nbsp;RI[15-11]: " + this.IROutput.RI_15_11;
            break ;
        case "RI_20_16":
            string = "&nbsp;RI[20-16]: " + this.IROutput.RI_20_16;
            break ;
        case "RI_25_21":
            string = "&nbsp;RI[25-21]: " + this.IROutput.RI_25_21;
            break ;
        case "RI_31_26":
            string = "&nbsp;RI[31-26]: " + this.IROutput.RI_31_26;
            break ;
        case "RI_25_0":
            string = "&nbsp;RI[25-0]: " + this.IROutput.RI_25_0;
            break ;
        case "ToRegisterDataMux":
            string = "&nbsp;Mux (Dados para o Registrador): 0x" + completeWithLeftZeros(this.ToRegisterDataMuxOutput.toString(16), 8);
            break ;
        case "ToRegisterSelectorMuxOutput":
            string = "&nbsp;Mux (Seletor de Registrador): " + this.ToRegisterSelectorMuxOutput;
            break ;
        case "ToALUMuxOutput":
            string = "&nbsp;Mux (Entrada da ALU): 0x" + completeWithLeftZeros(this.ToALUMuxOutput.toString(16), 8);
            break ;
        case "ToPCMUX1Output":
            string = "&nbsp;Mux (Seletor de Branch): 0x" + completeWithLeftZeros(this.ToPCMUX1Output.toString(16), 8);
            break ;
        case "ToPCMUX2Output":
            string = "&nbsp;Mux (Seletor de Jump): 0x" + completeWithLeftZeros(this.ToPCMUX2Output.toString(16), 8);
            break ;
        defaut:
            alert("Componente desconhecido!");
    }

    InspectorBody.innerHTML = string;
}

Simulator.prototype.setInspector = function(target) {

    this.inspectedComponent = target;
    this.updateInspector();
}

Simulator.prototype.nextCycleCallback = function() {

    if (this.executeCycle() == 0) {

        var that = this;
        this.timer = window.setTimeout(function() {that.nextCycleCallback();}, 1000 / that.freq);
    }
    else {

        if (this.exceptionCallback != null) {

            this.exceptionCallback();
            this.exceptionCallback = null;
        }
    }
}

Simulator.prototype.startSimulating = function(exceptionCallback) {

    this.exceptionCallback = exceptionCallback;
    if (this.timer == null) 
        this.nextCycleCallback();
}

Simulator.prototype.stopSimulating = function() {

    if (this.timer != null) {

        window.clearTimeout(this.timer);            
        this.timer = null;        
    }

    this.exceptionCallback = null;
}

/*
 * Getters and setters.
 */
Simulator.prototype.setPC = function(newPC) {

    // Assumes that newPC is in a numeric javascript type.
    this.PCOutput = newPC;    
}

Simulator.prototype.setFreq = function(newFreq) {

    this.freq = newFreq;
}


/* 
 * Helper functions to read/write from/to memory.
 */

Simulator.prototype.readByte = function(address) {

    var tableCell = document.getElementById('Mem' + address);

    if (tableCell == null) {

        alert("Exceção: tentativa de acesso ilegal à posição de memória " + address + "!");
        return(-1);
    }

    tableCell.style.backgroundColor = "#8C8";
    this.toClearColor[this.toClearColor.length] = tableCell;
//alert('readByte with address ' + address + ' returns ' + tableCell.innerHTML);
    return(tableCell.innerHTML);
}

Simulator.prototype.readHalfWord = function(address) {

    var pos0 = +address;
    var pos1 = pos0 + 1;

    var byte0 = this.readByte(pos0);
    if (byte0 == -1) return(-1);
    var byte1 = this.readByte(pos1);
    if (byte1 == -1) return(-1);

//alert('readHalfWord with address ' + address + ' returns byte0 = ' + byte0 + ' + byte1 = ' + byte1 + ' = ' + byte0 + byte1);
    return(byte0 + byte1);
}

Simulator.prototype.readWord = function(address) {

    var pos0 = +address;
    var pos1 = pos0 + 2;

    var half0 = this.readHalfWord(pos0);
    if (half0 == -1) return(-1);
    var half1 = this.readHalfWord(pos1);
    if (half1 == -1) return(-1);

//alert('readWord with address ' + address + ' returns half0 = ' + half0 + ' + half1 = ' + half1 + ' = ' + half0 + half1);
    return(half0 + half1);
}

/*
 * We assume 'value' is less than 256.
 */
Simulator.prototype.writeByte = function(address, value) {

    var tableCell = document.getElementById('Mem' + address);

    if (tableCell == null) {

        alert("Exceção: tentativa de acesso ilegal à posição de memória " + pos0 + "!");
        return(-1);
    }

    tableCell.innerHTML = completeWithLeftZeros(value.toString(16).toUpperCase(), 2);
    tableCell.style.backgroundColor = "#C88";
    this.toClearColor[this.toClearColor.length] = tableCell;

    return(0);
}

Simulator.prototype.writeHalfWord = function(address, value) {

    var pos0 = +address;
    var pos1 = pos0 + 1;

    var byte0 = Math.floor(value / 256);
    var byte1 = value % 256;

    if (this.writeByte(pos0, byte0) == -1) return(-1);
    if (this.writeByte(pos1, byte1) == -1) return(-1);

    return(0);
}

Simulator.prototype.writeWord = function(address, value) {

    var pos0 = +address;
    var pos1 = pos0 + 2;

    var halfWord0 = Math.floor(value / 65536);
    var halfWord1 = value % 65536;

    if (this.writeHalfWord(pos0, halfWord0) == -1) return(-1);
    if (this.writeHalfWord(pos1, halfWord1) == -1) return(-1);

    return(0);
}



