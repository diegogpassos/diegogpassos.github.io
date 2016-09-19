function initializeMemory(memorySize) {

    var addressTable = document.getElementById('TableMemoriaUpperAddress');
    var dataTable = document.getElementById('TableMemoriaDataCells');
    var numberOfLines = Math.floor(memorySize / 16);
    var addressTableGenHTML = "";
    var dataTableGenHTML = "";

    for (var i = 0; i < numberOfLines; i++) {

        addressTableGenHTML += "<tr>\n\t<td>" + completeWithLeftZeros(i.toString(16).toUpperCase(), 3) + "</td>\n</tr>\n";
        dataTableGenHTML += "<tr>\n";
        for (var j = 0; j < 16; j++) {

            dataTableGenHTML += "\t<td width=\"20px\" id=\"Mem" + (16*i + j) + "\" onclick=\"MemTableOnClick(this);\">00</td>\n";
        }
        dataTableGenHTML += "</tr>\n";
    }

    addressTable.innerHTML = addressTableGenHTML;
    dataTable.innerHTML = dataTableGenHTML;
}

function initialize() {

    /*
     * Parse URL parameters.
     */
    var QueryString = function () {
        // This function is anonymous, is executed immediately and 
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]], pair[1] ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        } 
        return query_string;
    }();

    /*
     * Initialize memory table with the specified size
     * (or the default).
     */
    if (typeof QueryString.MemSize === "undefined")
        initializeMemory(2048);
    else
        initializeMemory(QueryString.MemSize);

    /*
     * Create a simulator instance.
     */

    currentSimulator = new Simulator(0, 4);

    /*
     * Check if we need resizing.
     */
    onResizeCallback();
}

function onResizeCallback() {

    /*
     * Rescale everything in order to fit the width.
     */
    var actualBody = document.getElementsByTagName('body')[0];
    var body = document.getElementById('body');

    if (actualBody.clientWidth < 1249) {

        body.style.transform = "scale(" + (actualBody.clientWidth / 1249) + ")";
        body.style['-webkit-transform'] = "scale(" + (actualBody.clientWidth / 1249) + ")";
        body.style.transformOrigin = "0";
        body.style['-webkit-transform-origin'] = "0";
    }
    else {

        body.style.transform = "";
        body.style.transformOrigin = "";
        body.style['-webkit-transform'] = "";
        body.style['-webkit-transform-origin'] = "";
    }
}

window.onresize = function() { onResizeCallback(); };
window.onload = function() { initialize(); };

