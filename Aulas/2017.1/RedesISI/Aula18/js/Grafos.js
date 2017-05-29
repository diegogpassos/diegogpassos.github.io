Array.prototype.indexOf || (Array.prototype.indexOf = function(d, e) {
    var a;
    if (null == this) throw new TypeError('"this" is null or not defined');
    var c = Object(this),
        b = c.length >>> 0;
    if (0 === b) return -1;
    a = +e || 0;
    Infinity === Math.abs(a) && (a = 0);
    if (a >= b) return -1;
    for (a = Math.max(0 <= a ? a : b - Math.abs(a), 0); a < b;) {
        if (a in c && c[a] === d) return a;
        a++
    }
    return -1
});

Array.prototype.del = function (elem) {

  var index = this.indexOf(elem);
  if (index >= 0) this.splice(index, 1);
};

function Grafo(s) {

  var _this = this;

  this.s = s;
  this.nodes = [];
  this.edges = [];
  this.pendingLink = null;
  this.onChangeCB = null;
  this.selectedNode = null;

  this.s.dblclick(function(e) {_this.DrawNode(e.clientX, e.clientY);});
}

Grafo.prototype.OnChange = function (f) {

  this.onChangeCB = f;
};

Grafo.prototype.DrawNode = function (x, y, label) {

  if (typeof label === 'undefined') label = this.nodes.length.toString();

  var _this = this;
  var circle = s.circle(x, y, 20).attr({fill: "#ddd", stroke: "#000", strokeWidth: 2});
  var text = s.text(0, 0, label).attr({x: x, y: y + 3, textAnchor: "middle", alignmentBaseline: "middle"});
  var node = s.group();

  text.node.style.webkitUserSelect = "none";
  text.node.style.webkitTouchCallout = "none";
  text.node.style.khtmlUserSelect = "none";
  text.node.style.mozUserSelect = "none";
  text.node.style.msUserSelect = "none";
  text.node.style.userSelect = "none";

  node.add(circle);
  node.add(text);

  node.edges = [];

  node.drag(Grafo.prototype.MoveNode, Grafo.prototype.MoveNodeBegin, function() {Grafo.prototype.Redraw(_this);});
  node.click(function(e) {Grafo.prototype.SelectNode(e, this, _this);});

  this.nodes.push(node);

  if (this.onChangeCB != null) this.onChangeCB();

  return(node);
};

Grafo.prototype.EdgeLabelPos = function (sx, sy, dx, dy) {

  var tx, ty;

  if (sx == dx) {

    tx = sx - 10;
    ty = (sy + dy) / 2 + 5;
  }
  else if (sy == dy) {

    ty = sy - 9;
    tx = (sx + dx) / 2;
  }
  else if ((sx - dx) / (sy - dy) < 0) {

    tx = (sx + dx) / 2 - 15;
    ty = (sy + dy) / 2 - 3;
  }
  else {

    tx = (sx + dx) / 2 + 10;
    ty = (sy + dy) / 2 - 6;
  }

  return({x: tx, y: ty});
};

Grafo.prototype.DrawEdge = function (node1, node2, label) {

  var _this = this;
  var sx = node1[0].node.cx.baseVal.value;
  var sy = node1[0].node.cy.baseVal.value;
  var dx = node2[0].node.cx.baseVal.value;
  var dy = node2[0].node.cy.baseVal.value;
  var line = this.s.line(sx, sy, dx, dy).attr({stroke: '#000', strokeWidth: 2});
  var text = this.s.text(0, 0, label);
  var edge = this.s.group();
  var tpos = this.EdgeLabelPos(sx, sy, dx, dy);

  this.s.prepend(edge);

  text.attr({x: tpos.x, y: tpos.y, textAnchor: "middle", alignmentBaseline: "middle"});
  text.node.style.webkitUserSelect = "none";
  text.node.style.webkitTouchCallout = "none";
  text.node.style.khtmlUserSelect = "none";
  text.node.style.mozUserSelect = "none";
  text.node.style.msUserSelect = "none";
  text.node.style.userSelect = "none";

  edge.add(line, text);

  edge.node1 = node1;
  edge.node2 = node2;

  edge.click(function(e) {Grafo.prototype.SelectEdge(e, this, _this);});

  node1.edges.push(edge);
  node2.edges.push(edge);

  this.edges.push(edge);

  if (this.onChangeCB != null) this.onChangeCB();

  return(edge);
};

Grafo.prototype.MoveNodeBegin = function (x, y) {

  var node = this[0];

  node.diffX = node.node.cx.baseVal.value - x;
  node.diffY = node.node.cy.baseVal.value - y;
};

Grafo.prototype.MoveNode = function (dx, dy, posx, posy) {

  var node = this[0];
  var text = this[1];

  node.attr({ cx: posx + node.diffX, cy: posy + node.diffY});
  text.attr({x: node.node.cx.baseVal.value, y: node.node.cy.baseVal.value + 3});
};

Grafo.prototype.SelectNode = function (e, elem, grafo) {

  var node = elem[0];

  if (grafo.pendingLink != null) {

    grafo.s.unmousemove();
    grafo.DrawEdge(grafo.pendingLinkSrc, elem, '1');
    grafo.pendingLinkSrc = null;
    grafo.pendingLink.remove();
    grafo.pendingLink = null;

    if (grafo.onChangeCB != null) grafo.onChangeCB();
  }
  else {

    if (e.shiftKey && !e.ctrlKey) {

      var x = Number(node.attr('cx'));
      var y = Number(node.attr('cy'));
      grafo.pendingLink = grafo.s.line(x, y, x, y).attr({stroke: '#000', strokeWidth: 2});
      grafo.s.prepend(grafo.pendingLink);
      grafo.pendingLinkSrc = elem;
      grafo.s.mousemove(function(e) {Grafo.prototype.NewLinkMove(e, grafo);});
    }
    else if (e.ctrlKey && !e.shiftKey) {

      while(elem.edges.length > 0) {

        var e = elem.edges[0];

        grafo.edges.del(e);
        e.node1.edges.del(e);
        e.node2.edges.del(e);

        e.remove();
      }

      grafo.nodes.del(elem);
      elem.remove()

      if (grafo.onChangeCB != null) grafo.onChangeCB();

    }
    else if (e.shiftKey && e.ctrlKey) {

          var newLabel = window.prompt("Insira o novo label", elem[1].node.innerHTML);
          if (newLabel != null) {
            elem[1].node.innerHTML = newLabel;
          }

          if (grafo.onChangeCB != null) grafo.onChangeCB();

          return ;
    }
    else {

      grafo.ChangeSelectedNode(elem);

      if (grafo.onChangeCB != null) grafo.onChangeCB();
    }
  }
};

Grafo.prototype.SelectedNode = function () {
  return(this.selectedNode);
};

Grafo.prototype.ChangeSelectedNode = function (node) {

  if (this.selectedNode != null)
    this.UnHighlightNode(this.selectedNode);

  this.HighlightNode(node);
  this.selectedNode = node;
};

Grafo.prototype.NewLinkMove = function (e, grafo) {

  grafo.pendingLink.attr({x2: e.clientX, y2: e.clientY});
};

Grafo.prototype.Redraw = function (grafo) {

  for (var i = 0; i < grafo.edges.length; i++) {

    var line = grafo.edges[i][0];
    var text = grafo.edges[i][1];
    var node1 = grafo.edges[i].node1[0];
    var node2 = grafo.edges[i].node2[0];

    var sx = Number(node1.attr('cx'));
    var sy = Number(node1.attr('cy'));
    var dx = Number(node2.attr('cx'));
    var dy = Number(node2.attr('cy'));

    line.attr({x1:sx,
              y1: sy,
              x2: dx,
              y2: dy,
            });

    var tpos = Grafo.prototype.EdgeLabelPos(sx, sy, dx, dy);
    text.attr({x: tpos.x, y: tpos.y, textAnchor: "middle", alignmentBaseline: "middle"});
  }
};

Grafo.prototype.SelectEdge = function (e, elem, grafo) {

  if (e.ctrlKey) {

    elem.node1.edges.del(elem);
    elem.node2.edges.del(elem);

    elem.remove()
  }
  else {

    if (e.shiftKey) {

      var newWeight = window.prompt("Insira o novo peso", elem[1].node.innerHTML);
      if (newWeight != null) {
        elem[1].node.innerHTML = newWeight;
      }
    }
  }

  if (grafo.onChangeCB != null) grafo.onChangeCB();
};

Grafo.prototype.HighlightNode = function (node) {

      node[0].attr({stroke: "#3a3"});
};

Grafo.prototype.UnHighlightNode = function (node) {

      node[0].attr({stroke: "#000"});
};

Grafo.prototype.UnHighlightAllNodes = function () {

  for (var i = 0; i < this.nodes.length; i++) {
    this.UnHighlightNode(this.nodes[i]);
  }
};

Grafo.prototype.HighlightEdge = function (edge) {

      edge[0].attr({stroke: "#a33", strokeWidth: 3});
};

Grafo.prototype.UnHighlightEdge = function (edge) {

      edge[0].attr({stroke: "#000", strokeWidth: 2});
};

Grafo.prototype.UnHighlightAllEdges = function () {

  for (var i = 0; i < this.edges.length; i++) {
    this.UnHighlightEdge(this.edges[i]);
  }
};

Grafo.prototype.AdjacencyMatrix = function () {

  var adj = [];
  var neigh;

  for (var i = 0; i < this.nodes.length; i++) {
    adj.push([]);
    for (var j = 0; j < this.nodes[i].edges.length; j++) {

      if (this.nodes[i].edges[j].node1 == this.nodes[i]) neigh = this.nodes[i].edges[j].node2;
      else neigh = this.nodes[i].edges[j].node1;
      neigh = this.nodes.indexOf(neigh);

      adj[i].push({id: neigh, weight: Number(this.nodes[i].edges[j][1].node.innerHTML)});
    }
  }

  return(adj);
};

Grafo.prototype.Nodes = function () {
  return(this.nodes);
};

Grafo.prototype.FindEdge = function (node1, node2) {

  for (var i = 0; i < node1.edges.length; i++) {
    var edge = node1.edges[i];
    if (edge.node1 == node2 || edge.node2 == node2) return(edge);
  }

  return(null);
};
