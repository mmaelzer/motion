var request = require("request");
var MjpegConsumer = require("mjpeg-consumer");
var MotionStream = require('../lib/motionstream');
var FileOnWrite = require("file-on-write");

var writer = new FileOnWrite({ 
  path: './video',
  ext: '.jpg',
  filename: function(image) {
    return image.time;
  },
  transform: function(image) {
    return image.data;
  },
  sync: true
});

var consumer = new MjpegConsumer();
var motion = new MotionStream();

var options = {
  url: 'http://rax1.bsn.net/mjpg/video.mjpg?streamprofile=Balanced'
};

request(options).pipe(consumer).pipe(motion).pipe(writer);
