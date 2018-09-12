var base58check = require('base58check');
let bitcoinjs = require('bitcoinjs-lib');
var crypto = require('crypto');
var ripemd160 = require('ripemd160');

function generate(n, pubKeys){
    let script = redeem(n, pubKeys);
    return{
        script: script,
        address: address(script)
    };
}

function redeem(n, pubKeys){
    return bitcoinjs.script.multisig.output.encode(2, pubKeys.map(key=>Buffer.from(key,'hex'))).toString('hex');
};

function address(redeem){
    var hash = new ripemd160().update(crypto.createHash('sha256').update(Buffer.from(redeem, 'hex')).digest()).digest('hex').toString('hex');
    return base58check.encode(hash, '05');
};

module.exports = {
    generate: generate,
    address: address
};
