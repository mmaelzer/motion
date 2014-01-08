var Motion = require('./motion');
var decode = require('im-decode');
var TimedQueue = require('ttq');
var util = require('util');

function MotionStream(options) {
  options = options || {};

  this.prebuf = options.prebuffer || 2;
  this.postbuf = options.postbuffer || 2;

  this.preframes = [];
  this.postframes = [];
  this.nomotion = 0;

  this.resolution = options.resolution;
  this.interval = options.interval || 1000;

  this.queue = new TimedQueue({
    asyncTest: true,
    interval: this.interval,
    success: this.queueSuccess,
    fail: this.queueFail,
    test: this.queueTest,
    context: this
  });

  this.motion = new Motion({
    threshold: options.threshold,
    minChange: options.minChange
  });

  this.readable = true;
  this.writable = true;
};
util.inherits(MotionStream, require('stream'));

/**
 *  TimeTestQueue test callback to determine whether motion was found
 *  in the array of frames 
 *  @param {Array.<Buffer>} frames
 *  @param {Function(Boolean)} done
 */
MotionStream.prototype.queueTest = function(frames, done) {
  if (!frames || frames.length < 1) {
    process.nextTick(function() { done(false); });
    return;
  }
  decode((frames[0] || {}).data, this.resolution, (function(err, img) {
    if (err) return done(false);
    done(this.motion.detect(img));
  }).bind(this));
};

/**
 *  On TimeTestQueue fail, cache frames as the prebuffer 
 *  @param {Array.<Buffer>} frames
 */
MotionStream.prototype.queueFail = function(frames) {
  if (this.postBuffering()) {
    frames.forEach(this.sendFrame, this);
  } else {
    this.preframes.unshift(frames);
    this.preframes = this.preframes.slice(0, this.prebufferCap());
  }
};

/**
 *  Get the prebuffer size
 *  @return {Number} 
 */
MotionStream.prototype.prebufferCap = function() {
  return Math.max(Math.floor(this.prebuf*1000 / this.interval), 1);
};

/**
 *  On TimeTestQueue success, write frames with any prebuffered frames
 *  @param {Array.<Buffer>} frames
 */
MotionStream.prototype.queueSuccess = function(frames) {
  this.withPrebuffer(frames).forEach(this.sendFrame, this);
  this.preframes.length = 0;
  this.nomotion = 0;
};

/**
 *  Concat frames onto prebuffer frames
 *  @param {Array.<Buffer>} frames
 *  @return {Array.<Buffer>}
 */
MotionStream.prototype.withPrebuffer = function(frames) {
  return [].concat.apply([], this.preframes.slice(0).reverse()).concat(frames);
};

/**
 *  Send frames along
 *  @param {Array.<Buffer>} frames
 */
MotionStream.prototype.sendFrame = function(frame) {
  this.emit('data', frame);
};

/**
 *  A quick test whether we should write failed frames as a postbuffer
 *  @return {Boolean}
 */
MotionStream.prototype.postBuffering = function() {
  return (++this.nomotion * this.interval) <= (this.postbuf * 1000);
};

MotionStream.prototype.write = function(image) {
  this.queue.push({ data: image, time: Date.now() });
};

MotionStream.prototype.end = function(chunk) {
  this.writable = false;
};

MotionStream.prototype.destroy = function() {
  this.writable = false;
};

module.exports = MotionStream;