/* global describe, it, before */
'use strict';
var chai = require('chaijs/chai');
var expect = chai.expect;

var Constructor = require('..');

describe('interface', function() {
  var particles;
  before(function () {
    particles = new Constructor();
  });
  it('should have interfaces', function(){
    expect(particles.merge).to.be.a('function');
    expect(particles.collided).to.be.a('function');
  });
});
