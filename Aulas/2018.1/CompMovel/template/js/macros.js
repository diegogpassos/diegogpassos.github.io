// Image with style. Any list of css properties is valid. Usage example:
// ![:imageS width:50%;opacity:0.7](image.jpg)
remark.macros.imageS = function (style) {
  var url = this;
  return '<img src="' + url + '" style="' + style + '" />';
};

// Simpler image declaration macro. The only parameter is the width (declared
// in any unit, including percentage). Usage example:
// ![:image 50%](image.jpg)
remark.macros.image = function (width) {
  var url = this;
  return '<img src="' + url + '" style="width: ' + width + '" />';
};

// ![:iframe height, width](url)
remark.macros.iframe = function (height, width) {
  var url = this;
  return '<iframe src="' + url + '" height="' + height + '" width="' + width + '"></iframe>';
}

// ![:column width, optional style definition](content)
remark.macros.column = function(width, style) {

    return '<div style="width: ' + width + '; float: left;' + style + '">' + window.remark.convert(this) + "</div>";
}

// Creates a "block" on the slide. The content is passed as the parameter
// between parenthesis. If you want the block to contain a title, it should be
// placed alone in the first line of the parameter. The remaining lines are the
// markdown that will define the content of the block. Examples of how this
// macro should be used:
// ![:block](A Possibly Long Title, with many elements. This is still the title.
//* An item of a list.
//* A second item
//)
// ![:block](
//This block will have no title, just this sentence.
//)
remark.macros.block = function (style) {

  var ret = "";
  var title = "";
  var i;
  var md;

  args = this.split("\n");
  title = args[0];
  args.splice(0, 1);
  md = args.join('\n');

  if (style != "") ret = '<table class="block" style="' + style + '">';
  else ret = '<table class="block">';

  if (title != "") {

    ret += '<thead>';
    ret += '<tr>';
    ret += '<td>' + window.remark.convert(title) + '</td>';
    ret += '</tr>';
    ret += '</thead>';
  }
  ret += '<tbody>';
  ret += '<tr>';
  ret += '<td>' + window.remark.convert(md) + '</td>';
  ret += '</tr>';
  ret += '</table>';
  return ret;
};

// Creates a cover slide. Expects four parameters: an event, a title for the
// the presentation, the author name, and the logo.
// Parameters are specified as separated
// lines within the parenthesis argument. Example:
// ![:cover](
// Programação de Computadores
// Aula 1: Introdução à Disciplina
// Fernanda Passos
// logo.svg
// )
// The first argument may be placed in the same line as the macro name. Empty
// lines are ignored.
// The background image is currently hardcoded, but may be changed
// by simply replacing the file "img/bg.png".
remark.macros.cover = function() {

  var ret = "";
  var i;

  args = this.split("\n");
  for (i = 0; i < args.length; i++) {

    if (args[i] == "") args.splice(i, 1);
  }

  if (args.length < 4) console.log("Cover Macro: Not enough argments. Render may not be correct.")
  else if (args.length > 4) console.log("Cover Macro: Too many arguments. Render may not be correct.")

  var where = args[0];
  var what = args[1];
  var author = args[2];
  var logo = args[3];

  ret += '<span class="cover-slide-logo"><img src="' + logo + '"></img></span>';
  ret += '<div style="width: 90%; position: absolute; top: 60%; left: 5%; color: #FFF; text-align: center;">';
  ret += '<table class="cover-slide-table">';
  ret += '  <tr>';
  ret += '    <td style="width: 50%; padding-right: 2%;"><hr style="border: 0; border-top: 2px solid #FFF;"></td>';
  ret += '    <td style="white-space: nowrap; font-size: 22px; padding-left: 1px;">' + where + '</td>';
  ret += '    <td style="width: 50%; padding-left: 2%;"><hr style="border: 0; border-top: 2px solid #FFF;"></td>';
  ret += '  </tr>';
  ret += '</table>';
  ret += '<div style="font-size: 41px; margin-top: 1%; margin-bottom: 2%;">' + what + '</div>';
  ret += '<hr style="border: 0; border-top: 2px solid #FFF;">';
  ret += '<span style="font-size: 22px;">' + author + '</span>';
  ret += '</div>';

  return ret;
}

// ![:translate](md)
// Translates the markdown passed as argument to html.
remark.macros.translate = function() {

    console.log(window.remark.convert(this));
    return window.remark.convert(this);
}

// ![:dagre css-like style definition](dot-like graph definition)
remark.macros.dagre = function(style) {

    var g = graphlibDot.read(this);

    g.graph().marginx = 20;
    g.graph().marginy = 20;

    if (typeof window.dagreGraphs === 'undefined') window.dagreGraphs = [];
    var idx = window.dagreGraphs.push(g) - 1;

    return '<svg idx="' + idx + '" style="' + style + '"><g/></svg>';
}

// ![:comment]()
remark.macros.comment = function() {
}

remark.macros.position = function(posSpec) {

    return '<div style="' + posSpec + '; display: inline-block; position: absolute;">' + window.remark.convert(this) + '</div>';
}
