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
  // password that will be automatically passed
  password: "...",
  // read-only mount
  readonly: true,
  // hide it from user
  nobrowse: true,
  // auto open in Finder
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
