var specificCallbacksEnabled = true;
var currentAssembler = null;
var currentSimulator = null;

function RegTableOnClick(cell) {

    if (specificCallbacksEnabled) {

        specificCallbacksEnabled = false;

        var newInput = document.createElement('input');

        newInput.type = "text";
        newInput.maxLength = "8";
        newInput.style.width = "100%";
        newInput.style.height = "100%";
        newInput.style.textAlign = "center";
        newInput.style.borderWidth = "0px";
        newInput.value = cell.innerHTML;

        cell.innerHTML = "";
        cell.appendChild(newInput);
        newInput.focus();
        newInput.select();
        newInput.addEventListener("blur", RegTableOnClickDone);
        newInput.addEventListener("keydown", InputKeyboard);
    }
}

function RegTableOnClickDone(event) {

    var newInput = event.target;
    var cell = newInput.parentNode;
    var newText = newInput.value.trim();

    /*
     * Validate input: must be composed only of hexdecimal algarisms
     */
    
    if (RegExp("^[0-9a-fA-F]*$").test(newText)) {

        cell.innerHTML = completeWithLeftZeros(newText.toUpperCase(), 8);
        specificCallbacksEnabled = true;
    }
    else {

        alert("Valor inválido. Valor deve ser especificado em hexadecimal.");
        newInput.select();
    }
    
}

function RITableOnClick(cell) {

    if (specificCallbacksEnabled) {

        specificCallbacksEnabled = false;

        var newInput = document.createElement('input');

        newInput.type = "text";
        newInput.maxLength = "32";
        newInput.style.width = "100%";
        newInput.style.height = "100%";
        newInput.style.textAlign = "center";
        newInput.style.borderWidth = "0px";
        newInput.value = cell.innerHTML;

        cell.innerHTML = "";
        cell.appendChild(newInput);
        newInput.focus();
        newInput.select();
        newInput.addEventListener("blur", RITableOnClickDone);
        newInput.addEventListener("keydown", InputKeyboard);
    }
}

function RITableOnClickDone(event) {

    var newInput = event.target;
    var cell = newInput.parentNode;
    var newText = newInput.value.trim();

    /*
     * Validate input: must be composed only of hexdecimal algarisms
     */
    
    if (RegExp("^[01]*$").test(newText)) {

        cell.innerHTML = completeWithLeftZeros(newText, 32);
        specificCallbacksEnabled = true;
    }
    else {

        alert("Valor inválido. Valor deve ser especificado em hexadecimal.");
        newInput.select();
    }
    
}

function MemTableOnClick(cell) {

//    alert("Clique na posição de memória " + cell.id);

    if (specificCallbacksEnabled) {

        var w, h;

        specificCallbacksEnabled = false;

        var newInput = document.createElement('input');

        newInput.type = "text";
        newInput.maxLength = "2";
        newInput.style.width = "100%";
        newInput.style.height = "100%";
        newInput.style.textAlign = "center";
        newInput.style.borderWidth = "0px";
        newInput.value = cell.innerHTML;

        cell.innerHTML = "";
        cell.appendChild(newInput);
        newInput.focus();
        newInput.select();
        newInput.addEventListener("blur", MemTableOnClickDone);
        newInput.addEventListener("keydown", InputKeyboard);
    }
}

function MemTableOnClickDone(event) {

    var newInput = event.target;
    var cell = newInput.parentNode;
    var newText = newInput.value.trim();

    /*
     * Validate input: must be composed only of hexdecimal algarisms
     */
    
    if (RegExp("^[0-9a-fA-F]*$").test(newText)) {

        cell.innerHTML = completeWithLeftZeros(newText.toUpperCase(), 2);
        specificCallbacksEnabled = true;
    }
    else {

        alert("Valor inválido. Valor deve ser especificado em hexadecimal.");
        newInput.select();
    }
    
}

function InputKeyboard(event) {

    if (event.keyCode == 13) event.target.blur();
}

function BtnAssembleOnClick() {

    var sourceCode = document.getElementById('assemblyCode').value;
    var binaryCode;
    var assemblerReturn;
    var assembler;

    assembler = new Assembler(sourceCode);
    assemblerReturn = assembler.parse();
    if (assemblerReturn != "") {

        alert(assemblerReturn);           
    }
    else {

        binaryCode = assembler.getBinaryCode();

        var outputTable = document.getElementById('TableExecutableCodeBody');
        var generatedHTML = "";

        for (var i = 0; i < binaryCode.length; i++) {

            generatedHTML = generatedHTML + "<tr>\n";
            generatedHTML = generatedHTML + "\t<td width=\"65px\">" + completeWithLeftZeros(i, 3) + "</td>\n";
            generatedHTML = generatedHTML + "\t<td width=\"125px\">" + completeWithLeftZeros(parseInt(binaryCode[i], 2).toString(16).toUpperCase(), 8) + "</td>\n";
            generatedHTML = generatedHTML + "\t<td width=\"445px\">" + binaryCode[i].substring(0, 8) + " "  + binaryCode[i].substring(8, 16) + " " + binaryCode[i].substring(16, 24) + " " + binaryCode[i].substring(24, 32) + "</td>\n";
            generatedHTML = generatedHTML + "</tr>\n";
        }

        outputTable.innerHTML = generatedHTML;
    }

    /*
     * Store the parser for future handling (such as address relocation).
     */
    currentAssembler = assembler;
}

function BtnLoadOnClick() {

    var memoryCell;
    var i;
    var instruction;
    var baseAddress;
    var currentExecutable;

    if (currentAssembler == null) {

        alert("Execute o montador primeiro.");
        return ; 
    }
    
    baseAddress = document.getElementById('MemoryLoadPos').value;
    if (baseAddress == "" || baseAddress * 1 != baseAddress) {

        alert("Endereço de carregamento inválido!");
        return ;
    }

    baseAddress = +baseAddress;

    if (baseAddress % 4 != 0) {

        alert("Endereço base não é alinhado ao tamanho da palavra. Instruções de Jump não funcionarão corretamente!");
    }

    currentExecutable = currentAssembler.getBinaryCodeWithRelocation(baseAddress);

    for (i = 0; i < currentExecutable.length; i++) {

        instruction = completeWithLeftZeros(parseInt(currentExecutable[i], 2).toString(16).toUpperCase(), 8);

        memoryCell = document.getElementById('Mem' + (baseAddress++));
        memoryCell.innerHTML = instruction.substring(0, 2);
        memoryCell = document.getElementById('Mem' + (baseAddress++));
        memoryCell.innerHTML = instruction.substring(2, 4);
        memoryCell = document.getElementById('Mem' + (baseAddress++));
        memoryCell.innerHTML = instruction.substring(4, 6);
        memoryCell = document.getElementById('Mem' + (baseAddress++));
        memoryCell.innerHTML = instruction.substring(6, 8);
    }
}

function BtnRunOnClick() {

    /*
     * Get the current value of PC.
     */

    var RegTableEntry = document.getElementById('regPC');
    var PCValue = parseInt(RegTableEntry.innerHTML, 16);

    /*
     * Get the simulation frequency.
     */

    var freqS = document.getElementById('Freq').value;
    var freq = parseInt(freqS);
    if (freqS == "" || freq <= 0) {

        alert("Valor de frequência inválido!");
        return ;
    }

    /*
     * Disable any user interaction with the register and memory tables.
     */
    specificCallbacksEnabled = false;

    /*
     * Also, disable loading new executables.
     */
    document.getElementById('LoadBtn').disabled = true;

    /*
     * The "run" and "next" buttons of the simulation control panel 
     * also have to be disabled.
     */

    document.getElementById('RunSimulationBtn').disabled = true;
    document.getElementById('NextSimulationBtn').disabled = true;

    /*
     * On the other hand, we enable the pause button.
     */
    document.getElementById('PauseSimulationBtn').disabled = false;

    if (currentSimulator == null) {

        currentSimulator = new Simulator(PCValue, freq);
    }
    else {

        currentSimulator.setPC(PCValue);
        currentSimulator.setFreq(freq);
    }

    /*
     * Run the simulation. We pass BtnPauseOnClick as a callback
     * to be called in case of an exception.
     */
    currentSimulator.startSimulating(BtnPauseOnClick);
}

function BtnPauseOnClick() {

    /*
     * Stop the simulation.
     */
    currentSimulator.stopSimulating();

    /*
     * Enable all user interaction with the register and memory tables.
     */
    specificCallbacksEnabled = true;

    /*
     * Also, enable loading new executables.
     */
    document.getElementById('LoadBtn').disabled = false;

    /*
     * The "run" and "next" buttons of the simulation control panel 
     * also have to be enabled.
     */

    document.getElementById('RunSimulationBtn').disabled = false;
    document.getElementById('NextSimulationBtn').disabled = false;

    /*
     * On the other hand, we disable the pause button.
     */
    document.getElementById('PauseSimulationBtn').disabled = true;
}

function BtnNextOnClick() {

    /*
     * Get the current value of PC.
     */

    var RegTableEntry = document.getElementById('regPC');
    var PCValue = parseInt(RegTableEntry.innerHTML, 16);

    /*
     * Get the simulation frequency.
     */

    var freqS = document.getElementById('Freq').value;
    var freq = parseInt(freqS);
    if (freqS == "" || freq <= 0) {

        alert("Valor de frequência inválido!");
        return ;
    }

    if (currentSimulator == null) {

        currentSimulator = new Simulator(PCValue, freq);
    }
    else {

        currentSimulator.setPC(PCValue);
        currentSimulator.setFreq(freq);
    }

    /*
     * Run the next simulation cycle.
     */
    currentSimulator.executeCycle();
}

function ShowSVGPopup(target) {

    if (currentSimulator != null) {

        currentSimulator.setInspector(target);
    }
}

function HideSVGPopup(evt) {

/*
    var svg = document.getElementById('ProcessorImage').contentDocument;
    var popup = svg.getElementById('popup');

    popup.style.display = "none";
*/    
}

function minimize(element) {

    var p = element.parentNode;
    var pp = p.parentNode;

    pp.style.height = p.offsetHeight + "px";
    pp.style.overflow = "hidden";

    element.innerHTML = "+";
    element.onclick = "maximize(this);";
    element.onclick = function() {maximize(element);};
}

function maximize(element) {

    var pp = element.parentNode.parentNode;

    pp.style.height = "";
    pp.style.overflow = "";

    element.innerHTML = "-";
    element.onclick = function() {minimize(element);};
}



