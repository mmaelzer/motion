var assert = require('assert');
var Motion = require('../index').Motion;

var IMG1 = [128,128,128,255,128,128,128,255,64,64,64,255,255,255,255,255];
var IMG2 = [96,96,96,255,128,128,128,255,64,64,64,255,255,255,255,255];
var BLENDED = [255,255,255,255,0,0,0,255,0,0,0,255,0,0,0,255];
describe('Motion', function() {
  describe('#constructor', function() {
    it('should create a motion object', function() {
      var motion = new Motion();
      assert.equal(motion instanceof Motion, true);
    })
  }),
  describe('#detect(img1, img2)', function() {
    it('should return whether there is motion found', function() {
      var motion = new Motion();
      assert.equal(motion.detect(IMG1, IMG2), true);
    }),
    it('should compare against the last image if only one image provided', function() {
      var motion = new Motion();
      motion.detect(IMG1);
      assert.equal(motion.detect(IMG2), true);
    })
  }),
  describe('#getLastImage()', function() {
    it('should return the last image passed into the #detect() method', function() {
      var motion = new Motion();
      motion.detect(IMG1);
      motion.detect(IMG2);
      assert.deepEqual(motion.getLastImage(), IMG2);
    })
  }),
  describe('#getBlendedImage()', function() {
    it('should return an image showing motion as white pixels on a black backgroudn', function() {
      var motion = new Motion();
      assert.deepEqual(motion.getBlendedImage(IMG1, IMG2), BLENDED);
    })
  })
})