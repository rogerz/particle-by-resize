/* global describe, it, before */
'use strict';
var chai = require('chaijs/chai');
var expect = chai.expect;

var Particle = require('..');

describe('particle', function() {
  var particle;
  before(function () {
    particle = new Particle();
  });

  it('should have interfaces', function(){
    expect(particle.sampling).to.be.a('function');
    expect(particle.merge).to.be.a('function');
    expect(particle.collided).to.be.a('function');
  });

  it('should initialize as an empty canvas', function() {
    expect(particle.data).to.eql([]);
    expect(particle.width).to.equal(0);
    expect(particle.height).to.equal(0);
  });

  it('should sample the canvas to particle', function() {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 4;

    var ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, 4, 4);

    particle.sampling(canvas);

    expect(particle.width).to.equal(1);
    expect(particle.height).to.equal(1);
    expect(particle.data).to.eql([1]);
  });
});
