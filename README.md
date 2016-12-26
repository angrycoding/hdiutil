# hdiutil [![npm version](https://badge.fury.io/js/hdiutil.svg)](https://npmjs.org/package/hdiutil)

Provides limited set of OSX hdiutil api for Node.js

### Installation

```bash
npm install hdiutil
```

### Retrieve information about already attached image by it's path

```javascript
var hdiutil = require('hdiutil');
hdiutil.info('image.dmg', function(error, mountPath, devicePath) {
  console.info(error, mountPath, devicePath);
});
```

### Attaching image

```javascript
var hdiutil = require('hdiutil');
hdiutil.attach('image.dmg', function(error) {
  console.info(error, mountPath, devicePath);
}, {
  // password dialog title (if needed)
  prompt: "Enter the password",
  // password that will be automatically passed to stdin (in case if omitted standard dialog will be shown)
  password: "...",
  // how many times to repeat authorization attempts (default = 0)
  repeat: 5,
  // read-only mount (default = false)
  readonly: true,
  // hide it from user (default = false)
  nobrowse: true,
  // auto open in Finder (default = false)
  autoopen: true
});
```

### Detaching image

```javascript
var hdiutil = require('hdiutil');
hdiutil.detach('image.dmg', function(error) {
  console.info(error);
}, true /* force detach */);
```
