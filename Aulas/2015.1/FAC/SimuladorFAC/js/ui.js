/*
 * Suport for numbering the textarea element.
 */
function textAreaWithLinesReloadLines(lineObj, ta) {

    /*
     * Count the number of lines in the TextArea.
     */

    var limit = ta.value.split("\n").length;
    var string = "1\n";
    for (var no = 2; no <= limit; no++) {

        string = string + "<br>" + no + "\n";
    }

    lineObj.innerHTML = string;
}

function textAreaWithLinesPositionLineObj(obj,ta) {

    var lineObjOffsetTop = 3;

    obj.style.top = (ta.scrollTop * -1 + lineObjOffsetTop) + 'px';   
}

function textAreaWithLinesCreate(id) {

    var el = document.createElement('DIV');
    var ta = document.getElementById(id);
    var lineObjOffsetTop = 3;
    ta.parentNode.insertBefore(el,ta);
    el.appendChild(ta);

    el.className='textAreaWithLines';
    el.style.width = (ta.offsetWidth + 30) + 'px';
    ta.style.position = 'absolute';
    ta.style.left = '30px';
    el.style.height = (ta.offsetHeight + 2) + 'px';
    el.style.overflow='hidden';
    el.style.position = 'relative';
    el.style.width = (ta.offsetWidth + 30) + 'px';
    var lineObj = document.createElement('DIV');
    lineObj.style.position = 'absolute';
    lineObj.style.top = lineObjOffsetTop + 'px';
    lineObj.style.left = '0px';
    lineObj.style.width = '27px';
    el.insertBefore(lineObj,ta);
    lineObj.style.textAlign = 'right';
    lineObj.className='lineObj';

    ta.onkeydown = function() { textAreaWithLinesPositionLineObj(lineObj,ta); };
    ta.onmousedown = function() { textAreaWithLinesPositionLineObj(lineObj,ta); };
    ta.onscroll = function() { textAreaWithLinesPositionLineObj(lineObj,ta); };
    ta.onblur = function() { textAreaWithLinesPositionLineObj(lineObj,ta); };
    ta.onfocus = function() { textAreaWithLinesPositionLineObj(lineObj,ta); };
    ta.onmouseover = function() { textAreaWithLinesPositionLineObj(lineObj,ta); };

    if (ta.addEventListener) {
        ta.addEventListener('input', function() {textAreaWithLinesReloadLines(lineObj, ta);}, false);
    } else if (ta.attachEvent) {
        ta.attachEvent('onpropertychange', function() {textAreaWithLinesReloadLines(lineObj, ta);});
    }
    textAreaWithLinesReloadLines(lineObj, ta);
}


