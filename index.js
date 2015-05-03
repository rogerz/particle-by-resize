'use strict';

var _ = require('lodash/lodash');

function ParticleError(message) {
	Error.captureStackTrace(this, this.constructor);
	this.name =this.constructor.name;
	this.message = message;
}

function ParticleByResize(options) {
	this.options = _.defaults(options, {
		scale: 0.25
	});
	this.data = [];
	this.width = this.height = 0;
}

ParticleByResize.prototype.sampling = function (canvas) {
	var scale = this.options.scale;
	var	cw = canvas.width * scale,	// context width
		ch = canvas.height * scale;	// context height

	var resizedCanvas = document.createElement('canvas');
	var c = resizedCanvas.getContext('2d');
	resizedCanvas.width = cw;
	resizedCanvas.height = ch;
	c.drawImage(canvas, 0, 0, cw, ch);

	var imageData = c.getImageData(0, 0, cw, ch);
	this.data = [];
	function occupied(imageData) {
		// imageData = [r,g,b,a]
		if (imageData[3] > 0) {
			return 1;
		} else {
			return 0;
		}
	}
	for (var i = 0; i < (imageData.length + 1)/ 4; i++) {
		this.data.push(occupied(imageData[i * 4]));
	}
	this.width = cw;
	this.height = ch;
	return this;
};

function createIndexInBg(background, newParticles, x, y) {
	var bgData = background.data;
	var newData = newParticles.data;
	return function indexInBg(i) {
		var xRel = i % newData.width;
		var yRel = i / newData.height;
		var xBg = x + xRel;
		var yBg = y + yRel;
		return xBg + yBg * bgData.height;
	};
}

// @arg fn takes two data and a result as arguments. The result includes
//		key "done" to indicator the end of iterator and
//   	key "data" for the return data
function createIterator(fn) {
	return function(background, particles, x, y) {
		if (particles.width + x > background.width || particles.height + y > background.height) {
			throw new ParticleError('placed out of bound');
		}
		var bgData = background.data;
		var ptData = particles.data;
		var indexInBg = createIndexInBg(background, particles, x, y);
		var result = {
			done: false,
			data: null
		};
		for (var i = 0; i < ptData.length; i++) {
			var j = indexInBg(i);
			fn(bgData[j], ptData[i], result);
			if (result.done) {
				return result.data;
			}
		}
	};
}

ParticleByResize.prototype.collided = createIterator(function (datumInBg, datumInPt, result) {
	if (datumInBg === 0 && datumInPt === 0) {
		result.done = false;
		result.data = false;
	} else {
		result.done = true;
		result.data = true;
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