"use strict";

Terminal.bindKeys = function() {};

var TermCast = function(elem, scriptPath) {

  this.MainDiv = elem;
  this.TerminalWindow = document.createElement("div");

  this.Controls = document.createElement("object");

  this.Controls.data = "js/images/player2.svg";
  this.Controls.style.width = "640px";
  var _this = this;
  this.Controls.onload = function() {

	var progressBar = _this.Controls.contentDocument.getElementById('ProgressBar');
	var playButton = _this.Controls.contentDocument.getElementById('PlayButton');
	var pauseButton = _this.Controls.contentDocument.getElementById('PauseButton');
	var stopButton = _this.Controls.contentDocument.getElementById('StopButton');

	_this.ProgressBar = _this.Controls.contentDocument.getElementById('ProgressBar');
	_this.ProgressPath = _this.Controls.contentDocument.getElementById('ProgressPath');
	_this.ProgressButton = _this.Controls.contentDocument.getElementById('ProgressButton');
	_this.TotalTimeComponent = _this.Controls.contentDocument.getElementById('TotalTime');
	_this.ElapsedTimeComponent = _this.Controls.contentDocument.getElementById('ElapsedTime');

	stopButton.onclick = function() {_this.stop(_this);};
	playButton.onclick = function() {_this.play(_this);};
	pauseButton.onclick = function() {_this.pause(_this);};
  }

  this.TerminalWindow.style.width = "640px";
  this.TerminalWindow.style.height = "425px";
  this.TerminalWindow.style.fontSize = "14px";
  this.TerminalWindow.style.fontSize = "monospace";

  this.MainDiv.appendChild(this.TerminalWindow);
  this.MainDiv.appendChild(this.Controls);

  this.terminal = new Terminal({cols: 80, rows: 25, cursorBlink: true});
  this.terminal.open(this.TerminalWindow);

  this.xhr = new XMLHttpRequest();
  this.xhr.parent = this;
  this.xhr.onload = this.xhrAnswer;
  this.xhr.open("GET", scriptPath);
  this.xhr.send();

  this.currentByte = 0;
  this.currentChunk = 0;
  this.currentTime = 0;
  this.totalTime = 0;
  this.nextChunkTimer = null;
};

TermCast.prototype.xhrAnswer = function() {

  var obj = JSON.parse(this.responseText);
  this.parent.timingdata = obj.timingdata.split('\n');
  this.parent.logdata = obj.logdata;

  var i, t = 0;
  for (i = 1; i < this.parent.timingdata.length - 1; i++) {

	  var delta = parseFloat(this.parent.timingdata[i].split(' ')[0]);
	  t += delta;
  }

  this.parent.totalTime = Math.floor(t);
};

TermCast.prototype.play = function(_this) {

  _this.nextChunk(_this);
  _this.progressTimer = window.setInterval(function(){_this.updateTime(_this);}, 1000);
  _this.TotalTimeComponent.innerHTML = pad(Math.floor(_this.totalTime / 60), 2) + ":" + pad(_this.totalTime % 60, 2);
};

TermCast.prototype.pause = function(_this) {

  if (_this.nextChunkTimer) {
    window.clearTimeout(_this.nextChunkTimer);
    window.clearInterval(_this.progressTimer);
  }
};

TermCast.prototype.stop = function(_this) {

  if (_this.nextChunkTimer) {
    window.clearTimeout(_this.nextChunkTimer);
    window.clearInterval(_this.progressTimer);
  }

  _this.ProgressBar.setAttribute('width', 0);
  _this.ProgressButton.setAttribute('transform', "translate(-6,-4)");
  _this.currentTime = 0;
  _this.currentByte = 0;
  _this.currentChunk = 0;
  _this.terminal.reset();
};

TermCast.prototype.nextChunk = function(_this) {

  if (_this.currentChunk >= _this.timingdata.length) {
    window.clearInterval(_this.terminal._blink);
    return ;
  }

  var chunkComponents = _this.timingdata[_this.currentChunk].split(' ');
  var howMany = parseInt(chunkComponents[1]);
  var outputBuffer = _this.logdata.slice(_this.currentByte, _this.currentByte + howMany);

  _this.terminal.write(outputBuffer);
  _this.currentByte += howMany;
  _this.currentChunk += 1;

  if (_this.currentChunk < _this.timingdata.length - 1) {
  	chunkComponents = _this.timingdata[_this.currentChunk].split(' ');
  	var howLong = parseFloat(chunkComponents[0]);
	_this.nextChunkTimer = window.setTimeout(function(){_this.nextChunk(_this);}, howLong * 1000);
  }
  else {
	window.clearInterval(_this.progressTimer);
  }
};

TermCast.prototype.updateTime = function(_this) {

  _this.currentTime += 1;

  var newWidth = parseFloat(_this.ProgressPath.getAttribute('width'));
  var proportion = _this.currentTime / _this.totalTime;

  if (proportion > 1) proportion = 1;
  newWidth = proportion * newWidth;
  _this.ProgressBar.setAttribute('width', newWidth);

  _this.ProgressButton.setAttribute('transform', "translate(" + (newWidth - 6) + ",-4)");

  if (_this.currentTime <= _this.totalTime)
	_this.ElapsedTimeComponent.innerHTML = pad(Math.floor(_this.currentTime / 60), 2) + ":" + pad(_this.currentTime % 60, 2);

}

function pad(num, size) {
	    var s = "000000000" + num;
	        return s.substr(s.length-size);
}

