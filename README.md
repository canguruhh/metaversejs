<p align="center">
  <a href="https://mvs.org/">
    <img src="https://mvs.org/images/metaverselogo.png" alt="">
  </a>
</p>

# MetaverseJS
[![Build Status](https://travis-ci.org/canguruhh/metaversejs.png?branch=master)](https://travis-ci.org/canguruhh/metaversejs)
A javascript library for the Metaverse blockchain.

## Installation
Install using npm:
``` bash
npm install metaversejs
```

## Setup
### NodeJS
``` javascript
let Metaverse = require('metaversejs');
```
<a href="https://nodei.co/npm/metaversejs/"><img src="https://nodei.co/npm/metaversejs.png?downloads=true&downloadRank=true&stars=true"></a>
### Browser
For use is webapps the npm package contains a dist/metaverse.min.js. You can generate this file from source using grunt.

## Usage
``` javascript
Metaverse.wallet.generateMnemonic()
  .then((mnemonic)=>Metaverse.wallet.fromMnemonic(mnemonic))
  .then((wallet)=>{let addr=[]; for(let i=0;i<10;i++){addr.push(wallet.getAddress(i))} return addr;})
  .then(console.log);
```
Or check the examples folder.

## Testing
To run the unit tests just execute:
``` bash
npm test
```



