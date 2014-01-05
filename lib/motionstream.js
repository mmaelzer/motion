var Motion = require('./motion');
var decode = require('im-decode');
var TimedQueue = require('ttq');

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
require('util').inherits(MotionStream, require('stream'));

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

MotionStream.prototype.queueFail = function(frames) {
  if (this.postBuffering()) {
    frames.forEach(this.sendFrame, this);
  } else {
    this.preframes.unshift(frames);
    this.preframes = this.preframes.slice(0, 
        Math.max(Math.floor(this.prebuf*1000 / this.interval), 1));
  }
};

MotionStream.prototype.queueSuccess = function(frames) {
  [].concat.apply([], this.preframes.reverse()).concat(frames).forEach(this.sendFrame, this);
  this.preframes.length = 0;
  this.nomotion = 0;
};

MotionStream.prototype.sendFrame = function(frame) {
  this.emit('data', frame);
};

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