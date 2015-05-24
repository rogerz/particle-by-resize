'use strict';

var _ = require('lodash/lodash');

function ParticleByResize(options) {
  this.options = _.assign({
    scale: 0.25
  }, options);
  this.data = [];
  this.width = this.height = 0;
}

ParticleByResize.prototype.sampling = function (canvas) {
  var scale = this.options.scale;
  var cw = Math.round(canvas.width * scale),  // context width
    ch = Math.round(canvas.height * scale); // context height

  var resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = cw;
  resizedCanvas.height = ch;
  var c = resizedCanvas.getContext('2d');
  c.drawImage(canvas, 0, 0);
  c.drawImage(canvas, 0, 0, cw, ch);

  var data = c.getImageData(0, 0, cw, ch).data;
  this.data = [];
  function occupied(pixelRgba) {
    // imageData = [r,g,b,a]
    if (pixelRgba[3] > 0) {
      return 1;
    } else {
      return 0;
    }
  }

  for (var i = 0; i < data.length; i = i + 4) {
    this.data.push(occupied(Array.prototype.slice.call(data, i, i+4)));
  }

  this.width = cw;
  this.height = ch;
  return this;
};

ParticleByResize.prototype.collidedWith = function collidedWith(change, x, y) {
  var base = this;

  if (x < 0 || x + change.width > base.width || y < 0 || y + change.height > base.height) {
    throw new Error('out of bound');
  }

  var indexInBg = (function (bg, pt, x, y) {
    return function (i) {
      var xRel = i % pt.width;
      var yRel = Math.floor(i / pt.width);
      var xBg = x + xRel;
      var yBg = y + yRel;
      if (xBg >= bg.width || xBg < 0 || yBg >= bg.height || yBg < 0) {
        return null;
      }
      return Math.round(xBg + yBg * bg.width);
    };
  })(base, change, Math.floor(x), Math.floor(y));

  var baseData = base.data;
  var chngData = change.data;
  for (var i = 0; i < chngData.length; i++) {
    var j = indexInBg(i);
    if (j !== null) {
      if (baseData[j] === 1 && chngData[i] === 1) {
        return true;
      }
    }
  }
  return false;
};

ParticleByResize.prototype.composite = function composite(change, x, y) {
  var base = this;

  if (x < 0 || x + change.width > base.width || y < 0 || y + change.height > base.height) {
    throw new Error('out of bound');
  }

  var indexInPt = (function (bg, pt, x, y) {
    return function (i) {
      var xRel = i % bg.width;
      var yRel = Math.floor(i / bg.width);
      var xPt = xRel - x;
      var yPt = yRel - y;
      if (xPt < 0 || xPt >= pt.width || yPt < 0 || yPt >= pt.height) {
        return null;
      }
      return Math.round(xPt + yPt * pt.width);
    };
  })(base, change, Math.floor(x), Math.floor(y));

  var baseData = base.data;
  var chngData = change.data;
  for (var i = 0; i < baseData.length; i ++) {
    var j = indexInPt(i);
    if (j !== null) {
      if (chngData[j] === 1) {
        baseData[i] = 1;
      }
    }
  }
};

module.exports = ParticleByResize;