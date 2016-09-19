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
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
            } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }   
    return query_string;
}();

var Dz = {
    remoteWindows: [],
    idx: -1,
    step: 0,
    slides: null,
    params: {
        autoplay: "1"
    }
};

Dz.init = function() {
    document.body.className = "loaded";

    this.slides = $$("body > section");
    this.placeFooter();

    if (QueryString.print) {

        this.printMode();
    }
    else if (QueryString.notes) {

        this.notesMode();
    }
    else {

        var notes = document.getElementsByClassName('slideNotes');
        for (var i = 0; i < notes.length; i++) {

            var p = notes[i].parentNode;
            p.removeChild(notes[i]);
        }

        document.getElementById('notesSpecific').disabled = true;
        document.getElementById('printSpecific').disabled = true;

        this.setupParams();
        this.onhashchange();
        this.setupTouchEvents();
        this.onresize();
    }
    this.checkCSS();
}

Dz.placeFooter = function() {
    var i;
    var shortAuthor, shortTitle, shortEvent;
    var s0 = "\n\n<footer>\n\t<div class=\"footerAuthor\">";
        var s1 = "</div>\n\t<div class=\"footerTitle\">";
        var s2 = "</div>\n\t<div class=\"footerEvent\">";
        var s3 = "</div>\n\t<div class=\"footerPage\">"
        var s4 = "</div>\n</footer>";
    var metas = document.getElementsByTagName('meta');

    for (i = 0; i<metas.length; i++) {
        if (metas[i].getAttribute("name") == "shortauthor") shortAuthor = metas[i].getAttribute("content");
        if (metas[i].getAttribute("name") == "shorttitle") shortTitle = metas[i].getAttribute("content");
        if (metas[i].getAttribute("name") == "shortevent") shortEvent = metas[i].getAttribute("content");
    }

    for (i = 0; i < this.slides.length; i++) {

        this.slides[i].innerHTML += s0 + shortAuthor + s1 + shortTitle + s2 + shortEvent + s3 + (i + 1) + " / " + this.slides.length + s4;
    }
}

Dz.setupParams = function() {
    var p = window.location.search.substr(1).split('&');
    p.forEach(function(e, i, a) {
        var keyVal = e.split('=');
        Dz.params[keyVal[0]] = decodeURIComponent(keyVal[1]);
    });
}

Dz.onkeydown = function(aEvent) {
    // Don't intercept keyboard shortcuts
    if (aEvent.altKey
    || aEvent.ctrlKey
    || aEvent.metaKey
    || aEvent.shiftKey) {
        return;
    }
    if ( aEvent.keyCode == 37 // left arrow
    || aEvent.keyCode == 38 // up arrow
    || aEvent.keyCode == 33 // page up
    ) {
        aEvent.preventDefault();
        this.back();
    }
    if ( aEvent.keyCode == 39 // right arrow
    || aEvent.keyCode == 40 // down arrow
    || aEvent.keyCode == 34 // page down
    ) {
        aEvent.preventDefault();
        this.forward();
    }
    if (aEvent.keyCode == 35) { // end
        aEvent.preventDefault();
        this.goEnd();
    }
    if (aEvent.keyCode == 36) { // home
        aEvent.preventDefault();
        this.goStart();
    }
    if (aEvent.keyCode == 32) { // space
        aEvent.preventDefault();
        this.toggleContent();
    }
}

/* Touch Events */

Dz.setupTouchEvents = function() {
    var orgX, newX;
    var tracking = false;

    var db = document.body;
    db.addEventListener("touchstart", start.bind(this), false);
    db.addEventListener("touchmove", move.bind(this), false);

    function start(aEvent) {
        aEvent.preventDefault();
        tracking = true;
        orgX = aEvent.changedTouches[0].pageX;
    }

    function move(aEvent) {
        if (!tracking) return;
        newX = aEvent.changedTouches[0].pageX;
        if (orgX - newX > 100) {
            tracking = false;
            this.forward();
            } else {
            if (orgX - newX < -100) {
                tracking = false;
                this.back();
            }
        }
    }
}

/* Adapt the size of the slides to the window */

Dz.onresize = function() {
    var db = document.body;
    var sx = db.clientWidth / window.innerWidth;
    var sy = db.clientHeight / window.innerHeight;
    var transform = "scale(" + (1/Math.max(sx, sy)) + ")";

    db.style.MozTransform = transform;
    db.style.WebkitTransform = transform;
    db.style.OTransform = transform;
    db.style.msTransform = transform;
    db.style.transform = transform;
}


Dz.getDetails = function(aIdx) {
    var s = $("section:nth-of-type(" + aIdx + ")");
    var d = s.$("details");
    return d ? d.innerHTML : "";
}

Dz.onmessage = function(aEvent) {
    var argv = aEvent.data.split(" "), argc = argv.length;
    argv.forEach(function(e, i, a) { a[i] = decodeURIComponent(e) });
    var win = aEvent.source;
    if (argv[0] === "REGISTER" && argc === 1) {
        this.remoteWindows.push(win);
        this.postMsg(win, "REGISTERED", document.title, this.slides.length);
        this.postMsg(win, "CURSOR", this.idx + "." + this.step);
        return;
    }
    if (argv[0] === "BACK" && argc === 1)
    this.back();
    if (argv[0] === "FORWARD" && argc === 1)
    this.forward();
    if (argv[0] === "START" && argc === 1)
    this.goStart();
    if (argv[0] === "END" && argc === 1)
    this.goEnd();
    if (argv[0] === "TOGGLE_CONTENT" && argc === 1)
    this.toggleContent();
    if (argv[0] === "SET_CURSOR" && argc === 2)
    window.location.hash = "#" + argv[1];
    if (argv[0] === "GET_CURSOR" && argc === 1)
    this.postMsg(win, "CURSOR", this.idx + "." + this.step);
    if (argv[0] === "GET_NOTES" && argc === 1)
    this.postMsg(win, "NOTES", this.getDetails(this.idx));
}

Dz.toggleContent = function() {
    // If a Video is present in this new slide, play it.
    // If a Video is present in the previous slide, stop it.
    var s = $("section[aria-selected]");
    if (s) {
        var video = s.$("video");
        if (video) {
            if (video.ended || video.paused) {
                video.play();
                } else {
                video.pause();
            }
        }
    }
}

Dz.setCursor = function(aIdx, aStep) {
    // If the user change the slide number in the URL bar, jump
    // to this slide.
    aStep = (aStep != 0 && typeof aStep !== "undefined") ? "." + aStep : ".0";
    window.location.hash = "#" + aIdx + aStep;
}

Dz.onhashchange = function() {
    var cursor = window.location.hash.split("#"),
    newidx = 1,
    newstep = 0;
    if (cursor.length == 2) {
        newidx = ~~cursor[1].split(".")[0];
        newstep = ~~cursor[1].split(".")[1];
        if (newstep > Dz.slides[newidx - 1].$$('.incremental > *').length) {
            newstep = 0;
            newidx++;
        }
    }
    if (newidx != this.idx) {
        this.setSlide(newidx);
    }
    if (newstep != this.step) {
        this.setIncremental(newstep);
    }
    for (var i = 0; i < this.remoteWindows.length; i++) {
        this.postMsg(this.remoteWindows[i], "CURSOR", this.idx + "." + this.step);
    }
}

Dz.back = function() {
    if (this.idx == 1 && this.step == 0) {
        return;
    }
    if (this.step == 0) {
        this.setCursor(this.idx - 1,
        this.slides[this.idx - 2].$$('.incremental > *').length);
        } else {
        this.setCursor(this.idx, this.step - 1);
    }
}

Dz.forward = function() {
    if (this.idx >= this.slides.length &&
    this.step >= this.slides[this.idx - 1].$$('.incremental > *').length) {
        return;
    }
    if (this.step >= this.slides[this.idx - 1].$$('.incremental > *').length) {
        this.setCursor(this.idx + 1, 0);
        } else {
        this.setCursor(this.idx, this.step + 1);
    }
}

Dz.goStart = function() {
    this.setCursor(1, 0);
}

Dz.goEnd = function() {
    var lastIdx = this.slides.length;
    var lastStep = this.slides[lastIdx - 1].$$('.incremental > *').length;
    this.setCursor(lastIdx, lastStep);
}

Dz.setSlide = function(aIdx) {
    this.idx = aIdx;
    var old = $("section[aria-selected]");
    var next = $("section:nth-of-type("+ this.idx +")");
    if (old) {
        old.removeAttribute("aria-selected");
        var video = old.$("video");
        if (video) {
            video.pause();
        }
    }
    if (next) {
        next.setAttribute("aria-selected", "true");
        var video = next.$("video");
        if (video && !!+this.params.autoplay) {
            video.play();
        }
        } else {
        // That should not happen
        this.idx = -1;
        // console.warn("Slide doesn't exist.");
    }
}

Dz.setIncremental = function(aStep) {
    this.step = aStep;
    var old = this.slides[this.idx - 1].$('.incremental > *[aria-selected]');
    if (old) {
        old.removeAttribute('aria-selected');
    }
    var incrementals = this.slides[this.idx - 1].$$('.incremental');
    if (this.step <= 0) {
        incrementals.forEach(function(aNode) {
            aNode.removeAttribute('active');
        });
        return;
    }
    var next = this.slides[this.idx - 1].$$('.incremental > *')[this.step - 1];
    if (next) {
        next.setAttribute('aria-selected', true);
        next.parentNode.setAttribute('active', true);
        var found = false;
        incrementals.forEach(function(aNode) {
            if (aNode != next.parentNode)
            if (found)
            aNode.removeAttribute('active');
            else
            aNode.setAttribute('active', true);
            else
            found = true;
        });
        } else {
        setCursor(this.idx, 0);
    }
    return next;
}

Dz.postMsg = function(aWin, aMsg) { // [arg0, [arg1...]]
    aMsg = [aMsg];
    for (var i = 2; i < arguments.length; i++)
    aMsg.push(encodeURIComponent(arguments[i]));
    aWin.postMessage(aMsg.join(" "), "*");
}

Dz.checkCSS = function() {
    // CSS suport.
    if (!("transform" in document.head.style)) {
        if (!("-moz-transform" in document.body.style)) {

            var sectionHeight = document.body.clientHeight;
            // Hack to center content on slides.
            var divs = document.getElementsByClassName('slideContent');
            for (i = 0; i < divs.length; i++) {

                var computedHeight = divs[i].clientHeight;
                divs[i].style.top = (sectionHeight * 0.425 - computedHeight / 2) + "px";
            }
        }
    }
}

Dz.printMode = function() {

    var notes = document.getElementsByClassName('slideNotes');
    for (var i = 0; i < notes.length; i++) {

        var p = notes[i].parentNode;
        p.removeChild(notes[i]);
    }

    document.getElementById('presentationSpecific').disabled = true;
    document.getElementById('presentationSpecific2').disabled = true;
    document.getElementById('notesSpecific').disabled = true;
    document.getElementById('printSpecific').disabled = false;
}

Dz.notesMode = function() {

    var i;
    for (i = 0; i < this.slides.length; i++) {
        
        var dv = document.createElement('div');
        var sibling = this.slides[i].nextSibling;
        var p = this.slides[i].parentNode;
        var notes = this.slides[i].getElementsByClassName('slideNotes')[0];

        dv.setAttribute('class', 'page');
        dv.appendChild(this.slides[i]);
        if (notes) dv.appendChild(notes);

        if (sibling) {

            p.insertBefore(dv, sibling);
        }
        else {

            p.appendChild(dv);
        }
    }

    document.getElementById('presentationSpecific').disabled = true;
    document.getElementById('presentationSpecific2').disabled = true;
    document.getElementById('notesSpecific').disabled = false;
    document.getElementById('printSpecific').disabled = true;
}

window.onload = Dz.init.bind(Dz);
if (!(QueryString.print) && !(QueryString.notes)) {
    window.onkeydown = Dz.onkeydown.bind(Dz);
    window.onresize = Dz.onresize.bind(Dz);
    window.onhashchange = Dz.onhashchange.bind(Dz);
    window.onmessage = Dz.onmessage.bind(Dz);
}

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {

        // closest thing possible to the ECMAScript 5 internal IsCallable
        // function 
        if (typeof this !== "function")
        throw new TypeError(
        "Function.prototype.bind - what is trying to be fBound is not callable"
        );

        var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
            return fToBind.apply( this instanceof fNOP ? this : oThis || window,
            aArgs.concat(Array.prototype.slice.call(arguments)));
        };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

var $ = (HTMLElement.prototype.$ = function(aQuery) {
    return this.querySelector(aQuery);
}).bind(document);

var $$ = (HTMLElement.prototype.$$ = function(aQuery) {
    return this.querySelectorAll(aQuery);
}).bind(document);

NodeList.prototype.forEach = function(fun) {
    if (typeof fun !== "function") throw new TypeError();
    for (var i = 0; i < this.length; i++) {
        fun.call(this, this[i]);
    }
}


