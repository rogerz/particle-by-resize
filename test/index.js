'use strict';
var chai = require('chaijs/chai');
var expect = chai.expect;

var Particle = require('..');

describe('particle', function() {
  describe('prototype', function () {
    var particle;

    before(function () {
      particle = new Particle();
    });

    it('should have interfaces', function(){
      var particle = new Particle();
      expect(particle.sampling).to.be.a('function');
      expect(particle.composite).to.be.a('function');
      expect(particle.collidedWith).to.be.a('function');
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

  describe('behavior', function () {
    var background, particle22, particle33;
    beforeEach(function init() {
      background = new Particle();
      particle22 = new Particle();
      particle33 = new Particle();

      // fake data since resizing result is not easy to predict
      background.width = background.height = 3;
      background.data = [1, 0, 0, 0, 1, 0, 0, 0, 0];

      particle22.width = particle22.height = 2;
      particle22.data = [0, 1, 1, 0];

      particle33.width = particle33.height = 3;
      particle33.data = [0, 1, 1, 1, 0, 1, 1, 1, 1];
    });

    describe('collision', function () {
      it('should detect collision', function () {
        expect(background.collidedWith(background, 0, 0)).to.be.true;
      });

      it('should detect no collision', function () {
        expect(background.collidedWith(particle22, 0, 0)).to.be.false;
      });

      it('should detect no collision', function () {
        expect(background.collidedWith(particle33, 0, 0)).to.be.false;
      });
    });

    describe('composite', function () {
      it('should composite smaller particle', function () {
        background.composite(particle22, 0, 0);
        expect(background.data).to.eql([1, 1, 0, 1, 1, 0, 0, 0, 0]);
      });
      it('should composite same size particle', function () {
        background.composite(particle33, 0, 0);
        expect(background.data).to.eql([1, 1, 1, 1, 1, 1, 1, 1, 1]);
      });
    });
  });
});
