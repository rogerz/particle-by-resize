'use strict';

var _ = require('lodash/lodash');
var format = require('samsonjs/format');

function ParticleByResize(options) {
  this.options = _.assign({
    scale: 0.25
  }, options);
  this.data = [];
  this.width = this.height = 0;
}

ParticleByResize.prototype.sampling = function (canvas) {
  var scale = this.options.scale;
  var cw = canvas.width * scale,  // context width
    ch = canvas.height * scale; // context height

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

ParticleByResize.prototype.collidedWith = function collidedWith(particle, x, y) {
  var background = this;
  var indexInBg = (function (bg, pt) {
    return function (i) {
      var xRel = i % pt.width;
      var yRel = Math.floor(i / pt.height);
      var xBg = x + xRel;
      var yBg = y + yRel;
      if (xBg >= bg.width || xBg < 0 || yBg >= bg.height || yBg < 0) {
        return null;
      }
      return xBg + yBg * bg.width;
    };
  })(background, particle);

  var bgData = background.data;
  var ptData = particle.data;
  for (var i = 0; i < ptData.length; i++) {
    var j = indexInBg(i);
    if (j !== null) {
      if (bgData[j] === 1 && ptData[i] === 1) {
        return true;
      }
    }
  }
  return false;
};

ParticleByResize.prototype.composite = function composite(particle, x, y) {
  var background = this;
  var indexInPt = (function (bg, pt) {
    return function (i) {
      var xRel = i % bg.width;
      var yRel = Math.floor(i / bg.height);
      var xPt = xRel - x;
      var yPt = yRel - y;
      if (xPt < 0 || xPt >= pt.width || yPt < 0 || yPt >= pt.height) {
        return null;
      }
      return xPt + yPt * pt.width;
    };
  })(background, particle);
  var bgData = background.data;
  var ptData = particle.data;
  for (var i = 0; i < bgData.length; i ++) {
    var j = indexInPt(i);
    if (j !== null) {
      if (ptData[j] === 1) {
        bgData[i] = 1;
      }
    }
  }
};

module.exports = ParticleByResize;