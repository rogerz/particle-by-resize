/* global describe, it, before */
'use strict';
var chai = require('chaijs/chai');
var expect = chai.expect;

var Grid = require('..');

describe('grid', function() {
  var grid;
  before(function () {
    grid = new Grid();
  });

  it('should have interfaces', function(){
    expect(grid.sampling).to.be.a('function');
    expect(grid.merge).to.be.a('function');
    expect(grid.collided).to.be.a('function');
  });
/*
  it('should initialize as an empty canvas', function() {
    expect(grid.data).to.eql([]);
    expect(grid.width).to.equal(0);
    expect(grid.height).to.equal(0);
  });

  it('should sample the canvas to grid', function() {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 4;

    var ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, 4, 4);

    grid.sampling(canvas);

    expect(grid.width).to.equal(1);
    expect(grid.height).to.equal(1);
    expect(grid.data).to.eql([1]);
  });
*/
});
