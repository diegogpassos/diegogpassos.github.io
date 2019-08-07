// Callback for building the numbering of each slide.
// Creates a visual representation of the progress, as well.
// Ignores the first slide (cover).
function onSlideCallback(current, total) {

  if (current == 1) return "";

  current -= 1;
  total -= 1;

  var ret = "";
  var r = 25;
  var alpha = 2 * Math.PI * current / total;
  var x = r * Math.sin(alpha);
  var y = -r * Math.cos(alpha);
  var fillColor = '#137562';
  var strokeColor = fillColor;

  if (current < total) {

    ret += '<svg style="position: absolute; left: 40px; bottom: 0px;" height="' + (2*r + 5) + 'px" width="' + (2*r + 5) + 'px">';
    ret += '<circle cx="' + (r + 2) + 'px" cy="' + (r + 2) + 'px" r="' + r + 'px" stroke="' + strokeColor + '" stroke-width="1" fill="none"/>';
    ret += '<g transform="translate(' + (r + 2) + ',' + (r + 2) + ')" stroke="none">';

    if (x > 0) {

      ret += '<path d="M0 0 0 -' + r + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + y + 'Z" fill="' + fillColor + '"/>'
    }
    else {

      ret += '<path d="M0 0 0 -' + r + 'A' + r + ' ' + r + ' 0 0 1 0 ' + r + 'Z" fill="' + fillColor + '"/>'
      ret += '<path d="M0 0 1 ' + r + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + y + 'Z" fill="' + fillColor + '"/>'
    }

    ret += '<text x="0" y="5" text-anchor="middle" fill="black">' + current + '/' + total + '</text>';

    ret += '</g>';
    ret += '</svg>';
  }
  else {

    ret += '<svg style="position: absolute; left: 40px; bottom: 0px;" height="' + (2*r + 5) + 'px" width="' + (2*r + 5) + 'px">';
    ret += '<circle cx="' + (r + 2) + 'px" cy="' + (r + 2) + 'px" r="' + r + 'px" stroke="' + strokeColor + '" stroke-width="1" fill="'+ fillColor + '"/>';
    ret += '<g transform="translate(' + (r + 2) + ',' + (r + 2) + ')" stroke="none">';
    ret += '<text x="0" y="5" text-anchor="middle" fill="black">' + current + '/' + total + '</text>';
    ret += '</g>';
    ret += '</svg>';
  }

  return ret;
}
