Motion
======
  
A node.js motion detection library that supports node.js streams.  
  
Using motion streams requires [ImageMagick](http://www.imagemagick.org) CLI tools to be installed. There's plenty of ways to install ImageMagick, choose what's right for you.
  
Install
------------

```
npm install motion
```


Motion Stream
------------

### Usage

```javascript
var MotionStream = require('motion').Stream;
var motion = new MotionStream();

mjpegconsumer.pipe(motion).pipe(filewriter);

```
  
### Stream Options
* **minimumMotion**: Number : default `2` : The minimum number of seconds of motion required before emitting data
* **prebuffer**: Number : default `4` : The motion stream will emit the prebuffer number of seconds of images prior to motion occurring with motion data.
* **postbuffer**: Number : default `4` : The motion stream will emit the postbuffer number of seconds of images after motion occurs.
  
  
Motion Object
-------------

### Usage

```javascript
var Motion = require('motion').Motion;
var motion = new Motion();
var hasMotion = motion.detect(image1, image2);
```
  
  
### Methods
  
#### detect(image1, [image2])
* image1 `Array` of `Number`
* image2 (optional): `Array` of `Number`
  
Detect is called with one or two flat arrays of RGBA values. If called with one parameter, detect will use the last `image1` as `image2`.
  
```javascript
var Motion = require('motion').Motion;
var motion = new Motion();
  
// img1, img2, img3, img4 created ... 
// all img's are strings of RGBA values
// and look like [128,128,128,255,...]

var hasMotion;

hasMotion = motion.detect(img1);
console.log(hasMotion);
// > false
  
hasMotion = motion.detect(img2);
console.log(hasMotion);
// > true

hasMotion = motion.detect(img3, img4);
console.log(hasMotion);
// > false
```
  
  
#### getLastImage()
Returns the last image.
  
```javascript
var motion = new Motion();

console.log(motion.detect(img1));
// > false
console.log(motion.detect(img2));
// > true

console.log(img2 === motion.getLastImage());
// > true
```
  
  
#### getBlendedImage(image1, image2)
* image1 `Array` of `Number`
* image2 `Array` of `Number`
  
Returns an image with detected motion as white pixels on a black background in the form of a flat array of RGBA numbers.
  
  
About
-----------
Inspiration for this library comes from [Romuald Quantin's excellent write up](http://www.adobe.com/devnet/html5/articles/javascript-motion-detection.html) on motion detection in Javascript.
