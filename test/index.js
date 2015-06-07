'use strict';
var chai = require('chai');
var expect = chai.expect;

var Particle = require('..');

describe('particle', function() {
  describe('prototype', function () {
    var particle;

    before(function () {
      particle = new Particle({
        scale: 0.25
      });
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
    var base, change22, change33;
    beforeEach(function init() {
      base = new Particle();
      change22 = new Particle();
      change33 = new Particle();

      // fake data since resizing result is not easy to predict
      base.width = base.height = 3;
      base.data = [1, 0, 0, 0, 1, 0, 0, 0, 0];

      change22.width = change22.height = 2;
      change22.data = [0, 1, 1, 0];

      change33.width = change33.height = 3;
      change33.data = [0, 1, 1, 1, 0, 1, 1, 1, 1];
    });

    describe('collision', function () {
      it('should detect collision', function () {
        expect(base.collidedWith(base, 0, 0)).to.be.true;
      });

      it('should detect no collision', function () {
        expect(base.collidedWith(change22, 0, 0)).to.be.false;
      });

      it('should detect no collision', function () {
        expect(base.collidedWith(change33, 0, 0)).to.be.false;
      });

      it('should throw exception when out of bound', function () {
        expect(function () {
          base.collidedWith(change22, -1, 0);
        }).to.throw(Error);
        expect(function () {
          base.collidedWith(change22, 0, -1);
        }).to.throw(Error);
        expect(function () {
          base.collidedWith(change22, base.width, 0);
        }).to.throw(Error);
        expect(function () {
          base.collidedWith(change22, 0, base.height);
        }).to.throw(Error);
      });
    });

    describe('composite', function () {
      it('should composite smaller particle', function () {
        base.composite(change22, 0, 0);
        expect(base.data).to.eql([1, 1, 0, 1, 1, 0, 0, 0, 0]);
      });
      it('should composite same size particle', function () {
        base.composite(change33, 0, 0);
        expect(base.data).to.eql([1, 1, 1, 1, 1, 1, 1, 1, 1]);
      });
    });
  });
});
