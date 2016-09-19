/*
 * Main class: the parser.
 */
function Assembler(SourceCode) {
    
    /*
     * Parser properties.
     */
    this.SourceCode = SourceCode;
    this.currentChar = 0;
    this.currentLine = 1;
    this.labels = Object(); // We store labels as properties of an object.
    this.rawInstructions = [];
    this.binaryCode = [];
    this.absoluteLabelReferences = []; // List of instruction indexes that must change in case of relocation.

    /*
     * Some useful constants.
     */
    this.tokens = Object.freeze({
        T_MNEMONIC          : 0,
        T_REGISTER          : 1,
        T_INTEGER           : 2,
        T_COMMA             : 3,
        T_COLON             : 4,
        T_OPENPAR           : 5,
        T_CLOSEPAR          : 6,
        T_LABEL             : 7,
        T_LINEBREAK         : 8,
        T_EOF               : 9,
        T_ERROR             : 10
    });

    this.token2String = [
        "mnemônico",
        "registrador",
        "inteiro",
        "vírgula",
        "dois pontos",
        "abre parênteses",
        "fecha parênteses",
        "label",
        "quebra de linha",
        "fim de arquivo",
        "erro"
    ];


    /*
     * Types of instructions.
     */
    this.instructionTypes = Object.freeze({
        lw      : this.instruction_lw,
        sw      : this.instruction_sw,
        add     : this.instruction_add,
        addi    : this.instruction_addi,
        sub     : this.instruction_sub,
        slt     : this.instruction_slt,
        beq     : this.instruction_beq,
        and     : this.instruction_and,
        or      : this.instruction_or,
        j       : this.instruction_j
    });
}

/*
 * Methods for reading the input.
 */
Assembler.prototype.nextChar = function() {

    var ch = this.SourceCode.charAt(this.currentChar);

    if (ch == '\n') this.currentLine++;
    this.currentChar++;

    return(ch);
}

Assembler.prototype.returnChar = function() {

    if (this.currentChar > 0)
        this.currentChar--;

    if (this.SourceCode.charAt(this.currentChar) == '\n') this.currentLine--;
}

/*
 * Helper methods for testing certain kinds of character.
 */
Assembler.prototype.isBlank = function(ch) {

    return(ch == ' ' || ch == '\t');
}

Assembler.prototype.isLineBreak = function(ch) {

    return(ch == '\n' || ch == '\r');
}

Assembler.prototype.isLetter = function(ch) {

    return((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'));
}

Assembler.prototype.isDigit = function(ch) {

    return(ch >= '0' && ch <= '9');
}

Assembler.prototype.isHexDigit = function(ch) {

    return(this.isDigit(ch) || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F'));
}

Assembler.prototype.isEOF = function(ch) {

    return(ch == "");
}

/*
 * Methods for generating certain kinds of 
 * instructions.
 */

/*
 * List of instructions:
 *  - lw: load word, op. 35 (100011), rs (5 bits) [base address], rt (5 bits) [destination register], mem offset (16 bits) [offset applied to base];
 *  - sw: load word, op. 46 (101011), rs (5 bits) [base address], rt (5 bits) [source register], mem offset (16 bits) [offset applied to base];
 *  - add: add two integer numbers, op. 0 (000000), func. 33 (100001), rs (5 bits) [operand], rt (5 bits) [operand], rd (5 bits) [result], 00000;
 *  - addi: add register and constant, op. 8 (001000), rs (5 bits) [operand], rt (5 bits) [destination], immediate (16 bits) [operand];
 *  - sub: subtract two integer numbers, op. 0 (000000), func. 34 (100010), rs (5 bits) [operand], rt (5 bits) [operand], rd (5 bits) [result], 00000;
 *  - slt: compare two numbers, op. 0 (000000), func. 42 (101010), rs (5 bits) [operand], rt (5 bits) [operand], rd (5 bits) [result, rs < rt?]
 *  - beq: branch if two registers are equal, op. 4 (000100), rs (5 bits) [operand], rt (5 bits) [operand], mem offset [offset*4 applied to current PC] 
 *  - AND: bitwise and operation, op. 0 (000000), func. 36 (100100), rs (5 bits) [operand], rt (5 bits) [operand], rd (5 bits) [result], 00000;
 *  - OR: bitwise or operation, op. 0 (000000), func. 37 (100101), rs (5 bits) [operand], rt (5 bits) [operand], rd (5 bits) [result], 00000;
 *  - j: inconditional jump to absolute target, op. 2 (000010), target (26 bits) [target is multiplied by 4];
 */

Assembler.prototype.instruction_lw = function(assembler, rawInstruction, instructionIdx) {

    var op = "100011";
    var rs;
    var rt;
    var offset;
    var instructionLine = rawInstruction[0];

    /*
     * First token is implicitly consumed (it must have been
     * a mnemonic and the secondary token must have been "lw".
     *
     * The second token must be checked: it must be a register.
     */
    if (rawInstruction[2].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[2].primary] + " como primeiro argumento.",
            code  : ""
        };

    rt = completeWithLeftZeros(rawInstruction[2].secondary.toString(2), 5);
    
    /*
     * The third token must be a an immediate address. In this
     * implementation, we only accept integer tokens.
     */
    if (rawInstruction[3].primary != assembler.tokens.T_INTEGER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_INTEGER] + ", obtido " + assembler.token2String[rawInstruction[3].primary] + " como segundo argumento.",
            code  : ""
        };
            
    if (rawInstruction[3].secondary > 32767 || rawInstruction[3].secondary < -32768)
        return {
            error : "Erro sintático na linha " + instructionLine + ": constante numérica de magnitude muito grande (" + rawInstruction[3].secondary + ").",
            code  : ""
        };
 
    offset = toTwoComplement(rawInstruction[3].secondary, 16);
    //offset = completeWithLeftZeros(rawInstruction[3].secondary.toString(2), 16);

    /*
     * The fourth token must be an open parentesis.
     */
    if (rawInstruction[4].primary != assembler.tokens.T_OPENPAR)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_OPENPAR] + ", obtido " + assembler.token2String[rawInstruction[4].primary] + " após o imediato do segundo argumento.",
            code  : ""
        };
 
    /*
     * The fifth token must be a register.
     */
    if (rawInstruction[5].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[5].primary] + " após o abre parênteses do segundo argumento.",
            code  : ""
        };
 
    rs = completeWithLeftZeros(rawInstruction[5].secondary.toString(2), 5);

    /*
     * The sixth token must be an close parentesis.
     */
    if (rawInstruction[6].primary != assembler.tokens.T_CLOSEPAR)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_CLOSEPAR] + ", obtido " + assembler.token2String[rawInstruction[6].primary] + " após o registrador do segundo argumento.",
            code  : ""
        };
 
    /*
     * We must guarantee that there are no more tokens.
     */
     if (rawInstruction.length > 7) 
        return {
            error : "Erro sintático na linha " + instructionLine + ": símbolo inesperado após o último argumento da instrução.",
            code  : ""
        };

    return {
        error : "",
        code  : op + rs + rt + offset
    };
}

Assembler.prototype.instruction_sw = function(assembler, rawInstruction, instructionIdx) {

    var op = "101011";
    var rs;
    var rt;
    var offset;
    var instructionLine = rawInstruction[0];

    /*
     * First token is implicitly consumed (it must have been
     * a mnemonic and the secondary token must have been "lw".
     *
     * The second token must be checked: it must be a register.
     */
    if (rawInstruction[2].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[2].primary] + " como primeiro argumento.",
            code  : ""
        };

    rt = completeWithLeftZeros(rawInstruction[2].secondary.toString(2), 5);
    
    /*
     * The third token must be a an immediate address. In this
     * implementation, we only accept integer tokens.
     */
    if (rawInstruction[3].primary != assembler.tokens.T_INTEGER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_INTEGER] + ", obtido " + assembler.token2String[rawInstruction[3].primary] + " como segundo argumento.",
            code  : ""
        };
            
    if (rawInstruction[3].secondary > 32767 || rawInstruction[3].secondary < -32768)
        return {
            error : "Erro sintático na linha " + instructionLine + ": constante numérica de magnitude muito grande (" + rawInstruction[3].secondary + ").",
            code  : ""
        };
    offset = toTwoComplement(rawInstruction[3].secondary, 16);
//    offset = completeWithLeftZeros(rawInstruction[3].secondary.toString(2), 16);

    /*
     * The fourth token must be an open parentesis.
     */
    if (rawInstruction[4].primary != assembler.tokens.T_OPENPAR)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_OPENPAR] + ", obtido " + assembler.token2String[rawInstruction[4].primary] + " após o imediato do segundo argumento.",
            code  : ""
        };
 
    /*
     * The fifth token must be a register.
     */
    if (rawInstruction[5].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[5].primary] + " após o abre parênteses do segundo argumento.",
            code  : ""
        };
 
    rs = completeWithLeftZeros(rawInstruction[5].secondary.toString(2), 5);

    /*
     * The sixth token must be an close parentesis.
     */
    if (rawInstruction[6].primary != assembler.tokens.T_CLOSEPAR)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_CLOSEPAR] + ", obtido " + assembler.token2String[rawInstruction[6].primary] + " após o registrador do segundo argumento.",
            code  : ""
        };
 
    /*
     * We must guarantee that there are no more tokens.
     */
     if (rawInstruction.length > 7) 
        return {
            error : "Erro sintático na linha " + instructionLine + ": símbolo inesperado após o último argumento da instrução.",
            code  : ""
        };

    return {
        error : "",
        code  : op + rs + rt + offset
    };
}

Assembler.prototype.instruction_addi = function(assembler, rawInstruction, instructionIdx) {

    var op = "001000";
    var rs;
    var rt;
    var imm;
    var instructionLine = rawInstruction[0];

    /*
     * First token is implicitly consumed (it must have been
     * a mnemonic and the secondary token must have been "lw".
     *
     * The second token must be checked: it must be a register.
     */
    if (rawInstruction[2].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[2].primary] + " como primeiro argumento.",
            code  : ""
        };

    rt = completeWithLeftZeros(rawInstruction[2].secondary.toString(2), 5);
    
    /*
     * The third token must be a register.
     */
    if (rawInstruction[3].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[3].primary] + " como segundo argumento.",
            code  : ""
        };
 
    rs = completeWithLeftZeros(rawInstruction[3].secondary.toString(2), 5);

    /*
     * The fourth token must be a an immediate. In this
     * implementation, we only accept integer tokens.
     */
    if (rawInstruction[4].primary != assembler.tokens.T_INTEGER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_INTEGER] + ", obtido " + assembler.token2String[rawInstruction[4].primary] + " como terceiro argumento.",
            code  : ""
        };
            
    if (rawInstruction[4].secondary > 32767 || rawInstruction[4].secondary < -32768)
        return {
            error : "Erro sintático na linha " + instructionLine + ": constante numérica de magnitude muito grande (" + rawInstruction[4].secondary + ").",
            code  : ""
        };
 
    imm = toTwoComplement(rawInstruction[4].secondary, 16);
    //imm = completeWithLeftZeros(rawInstruction[4].secondary.toString(2), 16);
 
    /*
     * We must guarantee that there are no more tokens.
     */
     if (rawInstruction.length > 5) 
        return {
            error : "Erro sintático na linha " + instructionLine + ": símbolo inesperado após o último argumento da instrução.",
            code  : ""
        };

    return {
        error : "",
        code  : op + rs + rt + imm
    };
}

Assembler.prototype.instruction_add = function(assembler, rawInstruction, instructionIdx) {

    var op = "000000";
    var func = "100000";
    var padding = "00000";
    var rs;
    var rt;
    var rd;
    var instructionLine = rawInstruction[0];

    /*
     * First token is implicitly consumed (it must have been
     * a mnemonic and the secondary token must have been "lw".
     *
     * The second token must be checked: it must be a register.
     */
    if (rawInstruction[2].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[2].primary] + " como primeiro argumento.",
            code  : ""
        };

    rd = completeWithLeftZeros(rawInstruction[2].secondary.toString(2), 5);
    
    /*
     * The third token must be a register.
     */
    if (rawInstruction[3].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[3].primary] + " como segundo argumento.",
            code  : ""
        };
 
    rs = completeWithLeftZeros(rawInstruction[3].secondary.toString(2), 5);

    /*
     * The fourth token must be a register.
     */
    if (rawInstruction[4].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[4].primary] + " como terceiro argumento.",
            code  : ""
        };
 
    rt = completeWithLeftZeros(rawInstruction[4].secondary.toString(2), 5);

    /*
     * We must guarantee that there are no more tokens.
     */
     if (rawInstruction.length > 5) 
        return {
            error : "Erro sintático na linha " + instructionLine + ": símbolo inesperado após o último argumento da instrução.",
            code  : ""
        };

     return {
        error : "",
        code  : op + rs + rt + rd + padding + func
     };
}

Assembler.prototype.instruction_sub = function(assembler, rawInstruction, instructionIdx) {

    var op = "000000";
    var func = "100010";
    var padding = "00000";
    var rs;
    var rt;
    var rd;
    var instructionLine = rawInstruction[0];

    /*
     * First token is implicitly consumed (it must have been
     * a mnemonic and the secondary token must have been "lw".
     *
     * The second token must be checked: it must be a register.
     */
    if (rawInstruction[2].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[2].primary] + " como primeiro argumento.",
            code  : ""
        };

    rd = completeWithLeftZeros(rawInstruction[2].secondary.toString(2), 5);
    
    /*
     * The third token must be a register.
     */
    if (rawInstruction[3].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[3].primary] + " como segundo argumento.",
            code  : ""
        };
 
    rs = completeWithLeftZeros(rawInstruction[3].secondary.toString(2), 5);

    /*
     * The fourth token must be a register.
     */
    if (rawInstruction[4].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[4].primary] + " como terceiro argumento.",
            code  : ""
        };
 
    rt = completeWithLeftZeros(rawInstruction[4].secondary.toString(2), 5);

    /*
     * We must guarantee that there are no more tokens.
     */
    if (rawInstruction.length > 5) 
        return {
            error : "Erro sintático na linha " + instructionLine + ": símbolo inesperado após o último argumento da instrução.",
            code  : ""
        };

    return {
        error : "",
        code  : op + rs + rt + rd + padding + func
    };
}

Assembler.prototype.instruction_and = function(assembler, rawInstruction, instructionIdx) {

    var op = "000000";
    var func = "100100";
    var padding = "00000";
    var rs;
    var rt;
    var rd;
    var instructionLine = rawInstruction[0];

    /*
     * First token is implicitly consumed (it must have been
     * a mnemonic and the secondary token must have been "lw".
     *
     * The second token must be checked: it must be a register.
     */
    if (rawInstruction[2].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[2].primary] + " como primeiro argumento.",
            code  : ""
        };

    rd = completeWithLeftZeros(rawInstruction[2].secondary.toString(2), 5);
    
    /*
     * The third token must be a register.
     */
    if (rawInstruction[3].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[3].primary] + " como segundo argumento.",
            code  : ""
        };
 
    rs = completeWithLeftZeros(rawInstruction[3].secondary.toString(2), 5);

    /*
     * The fourth token must be a register.
     */
    if (rawInstruction[4].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[4].primary] + " como terceiro argumento.",
            code  : ""
        };
 
    rt = completeWithLeftZeros(rawInstruction[4].secondary.toString(2), 5);

    /*
     * We must guarantee that there are no more tokens.
     */
     if (rawInstruction.length > 5) 
        return {
            error : "Erro sintático na linha " + instructionLine + ": símbolo inesperado após o último argumento da instrução.",
            code  : ""
        };

    return {
        error : "",
        code  : op + rs + rt + rd + padding + func
    };
}

Assembler.prototype.instruction_or = function(assembler, rawInstruction, instructionIdx) {

    var op = "000000";
    var func = "100101";
    var padding = "00000";
    var rs;
    var rt;
    var rd;
    var instructionLine = rawInstruction[0];

    /*
     * First token is implicitly consumed (it must have been
     * a mnemonic and the secondary token must have been "lw".
     *
     * The second token must be checked: it must be a register.
     */
    if (rawInstruction[2].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[2].primary] + " como primeiro argumento.",
            code  : ""
        };

    rd = completeWithLeftZeros(rawInstruction[2].secondary.toString(2), 5);
    
    /*
     * The third token must be a register.
     */
    if (rawInstruction[3].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[3].primary] + " como segundo argumento.",
            code  : ""
        };
 
    rs = completeWithLeftZeros(rawInstruction[3].secondary.toString(2), 5);

    /*
     * The fourth token must be a register.
     */
    if (rawInstruction[4].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[4].primary] + " como terceiro argumento.",
            code  : ""
        };
 
    rt = completeWithLeftZeros(rawInstruction[4].secondary.toString(2), 5);

    /*
     * We must guarantee that there are no more tokens.
     */
     if (rawInstruction.length > 5) 
        return {
            error : "Erro sintático na linha " + instructionLine + ": símbolo inesperado após o último argumento da instrução.",
            code  : ""
        };

    return {
        error : "",
        code  : op + rs + rt + rd + padding + func
    };
}

Assembler.prototype.instruction_slt = function(assembler, rawInstruction, instructionIdx) {

    var op = "000000";
    var func = "101010";
    var padding = "00000";
    var rs;
    var rt;
    var rd;
    var instructionLine = rawInstruction[0];

    /*
     * First token is implicitly consumed (it must have been
     * a mnemonic and the secondary token must have been "lw".
     *
     * The second token must be checked: it must be a register.
     */
    if (rawInstruction[2].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[2].primary] + " como primeiro argumento.",
            code  : ""
        };

    rd = completeWithLeftZeros(rawInstruction[2].secondary.toString(2), 5);
    
    /*
     * The third token must be a register.
     */
    if (rawInstruction[3].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[3].primary] + " como segundo argumento.",
            code  : ""
        };
 
    rs = completeWithLeftZeros(rawInstruction[3].secondary.toString(2), 5);

    /*
     * The fourth token must be a register.
     */
    if (rawInstruction[4].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[4].primary] + " como terceiro argumento.",
            code  : ""
        };
 
    rt = completeWithLeftZeros(rawInstruction[4].secondary.toString(2), 5);

    /*
     * We must guarantee that there are no more tokens.
     */
     if (rawInstruction.length > 5) 
        return {
            error : "Erro sintático na linha " + instructionLine + ": símbolo inesperado após o último argumento da instrução.",
            code  : ""
        };

    return {
        error : "",
        code  : op + rs + rt + rd + padding + func
    };
}

Assembler.prototype.instruction_beq = function(assembler, rawInstruction, instructionIdx) {

    var op = "000100";
    var rs;
    var rt;
    var imm;
    var instructionLine = rawInstruction[0];

    /*
     * First token is implicitly consumed (it must have been
     * a mnemonic and the secondary token must have been "lw".
     *
     * The second token must be checked: it must be a register.
     */
    if (rawInstruction[2].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[2].primary] + " como primeiro argumento.",
            code  : ""
        };

    rs = completeWithLeftZeros(rawInstruction[2].secondary.toString(2), 5);
    
    /*
     * The third token must be a register.
     */
    if (rawInstruction[3].primary != assembler.tokens.T_REGISTER)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_REGISTER] + ", obtido " + assembler.token2String[rawInstruction[3].primary] + " como segundo argumento.",
            code  : ""
        };
 
    rt = completeWithLeftZeros(rawInstruction[3].secondary.toString(2), 5);

    /*
     * The fourth token must be a an immediate. In this
     * implementation, we accept both integer and label tokens.
     */
    if (rawInstruction[4].primary != assembler.tokens.T_INTEGER && rawInstruction[4].primary != assembler.tokens.T_LABEL)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_INTEGER] + " ou " + assembler.token2String[assembler.tokens.T_LABEL] + ", obtido " + assembler.token2String[rawInstruction[4].primary] + " como terceiro argumento.",
            code  : ""
        };
            
    if (rawInstruction[4].primary == assembler.tokens.T_LABEL)
        rawInstruction[4].secondary = assembler.labels[rawInstruction[4].secondary] - instructionIdx;

    rawInstruction[4].secondary = rawInstruction[4].secondary - 1;

    if (rawInstruction[4].secondary > 32767 || rawInstruction[4].secondary < -32768)
        return {
            error : "Erro sintático na linha " + instructionLine + ": constante numérica de magnitude muito grande (" + rawInstruction[4].secondary + ").",
            code  : ""
        };
 
    imm = toTwoComplement(rawInstruction[4].secondary, 16);
    //imm = completeWithLeftZeros(rawInstruction[4].secondary.toString(2), 16);
 
    /*
     * We must guarantee that there are no more tokens.
     */
     if (rawInstruction.length > 5) 
        return {
            error : "Erro sintático na linha " + instructionLine + ": símbolo inesperado após o último argumento da instrução.",
            code  : ""
        };

    return {
        error : "",
        code  : op + rs + rt + imm
    };
}

Assembler.prototype.instruction_j = function(assembler, rawInstruction, instructionIdx) {

    var op = "000010";
    var imm;
    var instructionLine = rawInstruction[0];

    /*
     * First token is implicitly consumed (it must have been
     * a mnemonic and the secondary token must have been "lw".
     *
     * The second token must be a an immediate. In this
     * implementation, we accept both integer and label tokens.
     */
    if (rawInstruction[2].primary != assembler.tokens.T_INTEGER && rawInstruction[2].primary != assembler.tokens.T_LABEL)
        return {
            error : "Erro sintático na linha " + instructionLine + ": esperado " + assembler.token2String[assembler.tokens.T_INTEGER] + " ou " + assembler.token2String[assembler.tokens.T_LABEL] + ", obtido " + assembler.token2String[rawInstruction[2].primary] + " como primeiro argumento.",
            code  : ""
        };
            
    if (rawInstruction[2].primary == assembler.tokens.T_LABEL) {

        rawInstruction[2].secondary = assembler.labels[rawInstruction[2].secondary];

        /*
         * If the code is relocated, this reference needs to be 
         * correted. Let's save this information.
         */
        assembler.absoluteLabelReferences[assembler.absoluteLabelReferences.length] = instructionIdx;
    }

    if (rawInstruction[2].secondary > 67108863 || rawInstruction[2].secondary < 0)
        return {
            error : "Erro sintático na linha " + instructionLine + ": constante numérica de magnitude muito grande (" + rawInstruction[2].secondary + ").",
            code  : ""
        };
 
    imm = completeWithLeftZeros(rawInstruction[2].secondary.toString(2), 26);
 
    /*
     * We must guarantee that there are no more tokens.
     */
     if (rawInstruction.length > 3) 
        return {
            error : "Erro sintático na linha " + instructionLine + ": símbolo inesperado após o último argumento da instrução.",
            code  : ""
        };

    return {
        error : "",
        code  : op + imm
    };
}

/*
 * Lexical analysis.
 */
Assembler.prototype.nextToken = function() {

    var state = 0;
    var ch;
    var secondary = "";

    while(1) {

        ch = this.nextChar();
//alert("DEBUG: ch = '" + ch + "', state = " + state);
        switch(state) {

            case 0:

                /* 
                 * State 0: next token can be anything.
                 */

                if (this.isBlank(ch)) {

                    /*
                     * Blank space. Ignore it.
                     */
                    break ;
                }

                if (ch == ';') {

                    /*
                     * Beginning of a comment. Everything until the line break or eof
                     * is a comment. Use another state to get to the next line or eof.
                     */
                    state = 1;
                    break ;
                }

                if (this.isLetter(ch)) {

                    /*
                     * Either a mnemonic or a label. Decide in another state.
                     */
                    state = 2;

                    /*
                     * We store ch in the secondary token. It will be useful later.
                     */

                    secondary = secondary + ch;

                    break ;
                }

                if (this.isDigit(ch)) {

                    /*
                     * Some kind of number (decimal or hex). Hex numbers start with 0x,
                     * so we need one more character to decide. If ch != '0', then it
                     * must be a decimal.
                     */
                    if (ch == '0') {

                        state = 3;
                    }
                    else {

                        state = 4;
                    }

                    /*
                     * We store ch in the secondary token. It will be useful later.
                     */

                    secondary = secondary + ch;

                    break ;
                }

                if (ch == '-') {

                    /*
                     * Decimal number (with a prepended sign).
                     */
                    state = 7;

                    /*
                     * We store ch in the secondary token. It will be useful later.
                     */

                    secondary = secondary + ch;

                    break ;
                }

                if (ch == '$') {

                    /*
                     * Register. Next state will get the secondary token (index of the 
                     * register).
                     */
                     state = 5;
                     break ;
                }

                if (ch == ',') {

                    /*
                     * Comma. We are done.
                     */
                     return {

                         primary   : this.tokens.T_COMMA,
                         secondary : null
                     };
                }

                if (ch == ':') {

                    /*
                     * Colon. We are done.
                     */
                     return {

                         primary   : this.tokens.T_COLON,
                         secondary : null
                     };
                }

                if (ch == '(') {

                    /*
                     * Open parentesis. We are done.
                     */
                     return {

                         primary   : this.tokens.T_OPENPAR,
                         secondary : null
                     };
                }

                if (ch == ')') {

                    /*
                     * Close parentesis. We are done.
                     */
                     return {

                         primary   : this.tokens.T_CLOSEPAR,
                         secondary : null
                     };
                }

                if (this.isLineBreak(ch)) {

                    /*
                     * Line break (of some kind). We are done.
                     */
                     return {

                         primary   : this.tokens.T_LINEBREAK,
                         secondary : null
                     };
                }

                if (this.isEOF(ch)) {

                    /*
                     * Line break (of some kind). We are done.
                     */
                     return {

                         primary   : this.tokens.T_EOF,
                         secondary : null
                     };
                }

                /*
                 * If we got to this point, it must be a lexical error.
                 */

                 return {

                     primary   : this.tokens.T_ERROR,
                     secondary : "Erro léxico na linha " + this.currentLine + ": caracter inválido '" + ch + "'."
                 };

            case 1:
                         
                /*
                 * State 1: we are in the middle of a line comment.
                 * Keep reading the input until we reach an eol or eof.
                 */
                if (this.isLineBreak(ch)) {

                    /*
                     * Line break (of some kind). We are done.
                     */
                     return {

                         primary   : this.tokens.T_LINEBREAK,
                         secondary : null
                     };
                }

                if (this.isEOF(ch)) {

                    /*
                     * Line break (of some kind). We are done.
                     */
                     return {

                         primary   : this.tokens.T_EOF,
                         secondary : null
                     };
                }

                /*
                 * Anything else, we stay at the same state.
                 */

                break ;
            
            case 2:

                /*
                 * State 2: either a label or a mnemonic. In both cases, it is
                 * just a sequence of letters and digits (must begin with a letter). 
                 * We differentiate them by searching
                 * the string in our list of mnemonics.
                 * We keep reading characters in this state to find the end of 
                 * the string.
                 */
                if (this.isLetter(ch) || this.isDigit(ch)) {

                    /*
                     * We stay in this state and store ch in the secondary token.
                     */

                    secondary = secondary + ch;

                    break ;
                }

                /*
                 * Do not forget to "unread" the last character. It belongs to the
                 * next token.
                 */
                this.returnChar();

                /*
                 * If we got here, we have just read the first char for the next token.
                 * We must close this token. Now we determine whether it's a label or
                 * a mnemonic.
                 */
                if (typeof this.instructionTypes[secondary] === "undefined") {

                    /*
                     * Could not find a mnemonic with this name. Must be a label.
                     */

                     return {

                         primary   : this.tokens.T_LABEL,
                         secondary : secondary
                     };
                }
                else {

                    /*
                     * Mnemonic.
                     */

                     return {

                         primary   : this.tokens.T_MNEMONIC,
                         secondary : secondary
                     };
                }

                break ;

            case 3:

                /*
                 * Some kind of number that starts with 0. If it's
                 * hexdecimal, next char should be 'x'. Decimal, otherwise.
                 * In this last case, it might be composed only of the 
                 * single character 0 (already read).
                 */
                 if (ch == 'x') {

                    /*
                     * Hex: continue reading at the next state. Also,
                     * in this case we don't care about the prefix '0x'.
                     * We can discard what we read so far for the 
                     * secondary token.
                     */

                     secondary = "";
                     state = 6;

                     break;
                 }

                 if (this.isDigit(ch)) {

                     /*
                      * Decimal: continue reading at the next state.
                      */

                      secondary = secondary + ch;
                      state = 4;

                      break ;
                 }

                 /*
                  * If we got here, ch belongs to the next token and
                  * we have just read the (decimal) integer 0.
                  */

                /*
                 * Do not forget to "unread" the last character. It belongs to the
                 * next token.
                 */
                this.returnChar();

                 return {

                     primary   : this.tokens.T_INTEGER,
                     secondary : 0
                 };

            case 4:

                /*
                 * State 4: integer and certainly decimal. Just keep 
                 * reading the digits.
                 */

                if (this.isDigit(ch)) {

                     /*
                      * Continue reading in this state.
                      */

                      secondary = secondary + ch;

                      break ;
                }

                /*
                 * If we got here, ch belongs to the next token and
                 * we have just read a decimal integer.
                 */

                /*
                 * Do not forget to "unread" the last character. It belongs to the
                 * next token.
                 */
                this.returnChar();

                 return {

                     primary   : this.tokens.T_INTEGER,
                     secondary : parseInt(secondary, 10)
                 };

            case 5:

                /*
                 * State 5: a register identifier. The rest of the ID must
                 * be a number in base 10. Keep reading the digits.
                 */

                if (this.isDigit(ch)) {

                     /*
                      * Continue reading in this state.
                      */

                      secondary = secondary + ch;

                      break ;
                }

                /*
                 * If we got here, ch belongs to the next token and
                 * we have just read the numerical part of the ID. We
                 * still have to check if the ID is valid (is lower than
                 * the number of registers).
                 */

                /*
                 * Do not forget to "unread" the last character. It belongs to the
                 * next token.
                 */
                this.returnChar();

                var id = parseInt(secondary, 10);

                /*
                 * Be careful: the number of registers is hardcoded here.
                 */
                if (id < 32) {

                    return {

                        primary   : this.tokens.T_REGISTER,
                        secondary : id
                    };
                }
                else {

                    return {

                        primary   : this.tokens.T_ERROR,
                        secondary : "Erro léxico na linha " + this.currentLine + ": registrador inválido '$" + secondary + "'."
                    };
                }

            case 6:

                /*
                 * State 6: integer and certainly hexdecimal. Just keep 
                 * reading the hex digits.
                 */

                if (this.isHexDigit(ch)) {

                     /*
                      * Continue reading in this state.
                      */

                      secondary = secondary + ch;

                      break ;
                }

                /*
                 * If we got here, ch belongs to the next token and
                 * we have just read a hexdecimal integer.
                 */

                /*
                 * Do not forget to "unread" the last character. It belongs to the
                 * next token.
                 */
                this.returnChar();

                 return {

                     primary   : this.tokens.T_INTEGER,
                     secondary : parseInt(secondary, 16)
                 };

            case 7:

                /*
                 * State 7: integer and certainly decimal, with a minus sign.
                 * We must read at least one more digit.
                 */

                if (this.isDigit(ch)) {

                     /*
                      * Continue reading at state 4.
                      */

                      secondary = secondary + ch;
                      state = 4;

                      break ;
                }

                return {

                    primary   : this.tokens.T_ERROR,
                    secondary : "Erro léxico na linha " + this.currentLine + ": algarismo decimal esperado após sinal de menos."
                };
        }
    }
}

Assembler.prototype.parse = function() {

    var nextInstruction = [];
    var instructionCount = 0;
    var token;
    var state = 0;

    while(1) {

        token = this.nextToken();
        if (token.primary == this.tokens.T_ERROR) {
    
            return(token.secondary);
        }
//alert("DEBUG: token = " + this.token2String[token.primary] + "(" + token.primary + "), state = " + state);
        switch(state) {

            case 0:
                
                if (token.primary == this.tokens.T_EOF) {

                    return(this.parseRawInstructions());
                }

                if (token.primary == this.tokens.T_MNEMONIC) {

                    nextInstruction[0] = this.currentLine;
                    nextInstruction[1] = token;
                    state = 1;

                    break ;
                }

                if (token.primary == this.tokens.T_LABEL) {

                    /*
                     * Be careful: the length of an instruction is hardcoded here.
                     */
                    this.labels[token.secondary] = instructionCount;
                    state = 2;
                    break ;
                }

                if (token.primary == this.tokens.T_LINEBREAK) {

                    break ;
                }

                return("Erro sintático na linha " + this.currentLine + ": esperado " + this.token2String[this.tokens.T_EOF] + ", " + this.token2String[this.tokens.T_MNEMONIC] + " ou " + this.token2String[this.tokens.T_LABEL] + ". Encontrado " + this.token2String[token.primary] + ".");

            case 1:

                if (token.primary == this.tokens.T_REGISTER || token.primary == this.tokens.T_LABEL) {

                    nextInstruction[nextInstruction.length] = token;
                    state = 3;

                    break ;
                }

                if (token.primary == this.tokens.T_INTEGER) {

                    nextInstruction[nextInstruction.length] = token;
                    state = 4;

                    break ;
                }

                if (token.primary == this.tokens.T_LINEBREAK) {

                    this.rawInstructions[instructionCount++] = nextInstruction;
                    nextInstruction = [];
                    state = 0;

                    break ;
                }

                if (token.primary == this.tokens.T_EOF) {

                    this.rawInstructions[instructionCount++] = nextInstruction;
                    nextInstruction = [];
                    return(this.parseRawInstructions());
                }

                return("Erro sintático na linha " + this.currentLine + ": esperado " + this.token2String[this.tokens.T_REGISTER] + ", ou " + this.token2String[this.tokens.T_LABEL] + ", ou " + this.token2String[this.tokens.T_INTEGER] + ", ou " + this.token2String[this.tokens.T_LINEBREAK] + " ou " + this.token2String[this.tokens.T_EOF] + ". Encontrado " + this.token2String[token.primary] + ".");

            case 2:

                if (token.primary == this.tokens.T_COLON) {

                    state = 0;
                    break ;
                }

                return("Erro sintático na linha " + this.currentLine + ": esperado " + this.token2String[this.tokens.T_COLON] + " após um Label. Encontrado " + this.token2String[token.primary] + ".");

            case 3:

                if (token.primary == this.tokens.T_COMMA) {

                    state = 5;
                    break ;
                }

                if (token.primary == this.tokens.T_LINEBREAK) {

                    this.rawInstructions[instructionCount++] = nextInstruction;
                    nextInstruction = [];
                    state = 0;

                    break ;
                }

                if (token.primary == this.tokens.T_EOF) {

                    this.rawInstructions[instructionCount++] = nextInstruction;
                    nextInstruction = [];
                    return(this.parseRawInstructions());
                }

                return("Erro sintático na linha " + this.currentLine + ": esperado " + this.token2String[this.tokens.T_COMMA] + ", ou " + this.token2String[this.tokens.T_LINEBREAK] + " ou " + this.token2String[this.tokens.T_EOF] + ". Encontrado " + this.token2String[token.primary] + ".");

            case 4:

                if (token.primary == this.tokens.T_COMMA) {

                    state = 5;
                    break ;
                }

                if (token.primary == this.tokens.T_OPENPAR) {

                    state = 6;
                    nextInstruction[nextInstruction.length] = token;
                    break ;
                }

                if (token.primary == this.tokens.T_LINEBREAK) {

                    this.rawInstructions[instructionCount++] = nextInstruction;
                    nextInstruction = [];
                    state = 0;

                    break ;
                }

                if (token.primary == this.tokens.T_EOF) {

                    this.rawInstructions[instructionCount++] = nextInstruction;
                    nextInstruction = [];
                    return(this.parseRawInstructions());
                }

                return("Erro sintático na linha " + this.currentLine + ": esperado " + this.token2String[this.tokens.T_COMMA] + ", ou " + this.token2String[this.tokens.T_OPENPAR] + ", ou " + this.token2String[this.tokens.T_LINEBREAK] + " ou " + this.token2String[this.tokens.T_EOF] + ". Encontrado " + this.token2String[token.primary] + ".");

            case 5:            

                if (token.primary == this.tokens.T_REGISTER || token.primary == this.tokens.T_LABEL) {

                    nextInstruction[nextInstruction.length] = token;
                    state = 3;

                    break ;
                }

                if (token.primary == this.tokens.T_INTEGER) {

                    nextInstruction[nextInstruction.length] = token;
                    state = 4;

                    break ;
                }

                return("Erro sintático na linha " + this.currentLine + ": esperado " + this.token2String[this.tokens.T_REGISTER] + ", ou " + this.token2String[this.tokens.T_LABEL] + " ou " + this.token2String[this.tokens.T_INTEGER] + ". Encontrado " + this.token2String[token.primary] + ".");

            case 6:

                if (token.primary == this.tokens.T_REGISTER) {

                    nextInstruction[nextInstruction.length] = token;
                    state = 7;

                    break ;
                }

                return("Erro sintático na linha " + this.currentLine + ": esperado " + this.token2String[this.tokens.T_REGISTER] + ". Encontrado " + this.token2String[token.primary] + ".");
                
            case 7:

                if (token.primary == this.tokens.T_CLOSEPAR) {

                    nextInstruction[nextInstruction.length] = token;
                    state = 3;

                    break ;
                }

                return("Erro sintático na linha " + this.currentLine + ": esperado " + this.token2String[this.tokens.T_CLOSEPAR] + ". Encontrado " + this.token2String[token.primary] + ".");
                
        }
    }
}

Assembler.prototype.parseRawInstructions = function() {

    var i;
    var instructionCount = this.rawInstructions.length;
    var instructionBuilderReturn;
    var nextRawInstruction;
    var nextMnemonic;

    for (i = 0; i < instructionCount; i++) {

        nextRawInstruction = this.rawInstructions[i];
        nextMnemonic = nextRawInstruction[1].secondary;
//alert("DEBUG: nextMnemonic = " + nextMnemonic);        
        instructionBuilderReturn = this.instructionTypes[nextMnemonic](this, nextRawInstruction, i);

        if (instructionBuilderReturn.error != "") {

            return(instructionBuilderReturn.error);
        }

        this.binaryCode[i] = instructionBuilderReturn.code;
    }

    return("");
}

Assembler.prototype.getBinaryCode = function() {

    return(this.binaryCode);
}

Assembler.prototype.getBinaryCodeWithRelocation = function(offset) {

    var binaryCode = this.binaryCode.slice();
    var i;

    /*
     * We only need to worry/change jump instructions that reference 
     * labels (only case in which labels are used in absolute terms).
     */
    for (i = 0; i < this.absoluteLabelReferences.length; i++) {

        var instruction = binaryCode[this.absoluteLabelReferences[i]];
        
        /*
         * Since we know this is a jump instruction, we only 
         * need to worry about the 26 lower bits. Basically,
         * we need to sum them to the offset.
         */

        var originalAddress = parseInt(instruction.substring(6, 32), 2);
        /*
         * Be careful, offset must be divided by four because
         * the jump address counts words, not bytes.
         */
        var newAddress = (+originalAddress) + (+offset) / 4;

        /*
         * Be careful: we assume offset >= 0.
         */
        if (newAddress > 67108863) {

            return("Endereço base é muito alto.");
        }
        newAddress = completeWithLeftZeros(newAddress.toString(2), 26);
        binaryCode[this.absoluteLabelReferences[i]] = instruction.substring(0, 6) + newAddress;
    }
    return(binaryCode);
}

