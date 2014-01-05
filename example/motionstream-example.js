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

var username = "admin";
var password = "password";
var options = {
  url: "http://192.168.1.5/videostream.cgi",
  headers: {
    'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
  }  
};

request(options).pipe(consumer).pipe(motion).pipe(writer);