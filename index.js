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


// @arg fn takes two data and a result as arguments. The result includes
//    key "done" to indicator the end of iterator and
//    key "data" for the return data
function createIterator(fn) {
  var result = {
    done: false,
    data: null
  };

  function createIndexInBg(background, particles, x, y) {
    return function indexInBg(i) {
      var xRel = i % particles.width;
      var yRel = i / particles.height;
      var xBg = x + xRel;
      var yBg = y + yRel;
      if (xBg > background.width || xBg < 0 || yBg > background.height || yBg < 0) {
        throw new Error(format('out of bound: %d, %d', xBg, yBg));
      }
      return xBg + yBg * background.width;
    };
  }

  return function(particles, x, y) {
    // reset the result when no argument given
    if (arguments.length === 0) {
      result.done = false;
      result.data = null;
      return result.data;
    }

    if (isNaN(x) || isNaN(y)) {
      throw new Error(format('invalid offset: %d, %d', x, y));
    }

    var background = this;
    if (particles.width + x > background.width || particles.height + y > background.height) {
      throw new Error('placed out of bound');
    }
    var bgData = background.data;
    var ptData = particles.data;
    var indexInBg = createIndexInBg(background, particles, x, y);
    for (var i = 0; i < ptData.length; i++) {
      var j = indexInBg(i);
      try {
        fn(bgData[j], ptData[i], result);
      } catch(e) {
        throw new Error(format('invalid data bg[%d], pt[%d]', j, i));
      }
      if (result.done) {
        return result.data;
      }
    }
    result.done = true;
    return result.data;
  };
}

ParticleByResize.prototype.collidedWith = createIterator(function (datumInBg, datumInPt, result) {
  if (datumInBg === 0 || datumInPt === 0) {
    result.done = false;
    result.data = false;
  } else if (datumInBg === 1 && datumInPt === 1) {
    result.done = true;
    result.data = true;
  } else {
    throw new Error(format('invalid data: %s or %s', datumInBg, datumInPt));
  }
});

ParticleByResize.prototype.merge = createIterator(function (datumInBg, datumInPt, result) {
  if (result.data === null) {
    result.data = [];
  }
  if (datumInBg === 0 && datumInPt === 0) {
    result.data.push(0);
  } else {
    result.data.push(1);
  }
  result.done = false;
});

module.exports = ParticleByResize;