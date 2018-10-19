var base58check = require('base58check');
let bitcoinjs = require('bitcoinjs-lib');
var crypto = require('crypto');
var ripemd160 = require('ripemd160');

function generate(m, pubKeys){
    let script = redeem(m, pubKeys);
    return{
        script: script,
        address: address(script)
    };
}

function redeem(m, pubKeys){
    return bitcoinjs.script.multisig.output.encode(m, pubKeys.map(key=>Buffer.from(key,'hex')).sort()).toString('hex');
};

function address(redeem){
    var hash = new ripemd160().update(crypto.createHash('sha256').update(Buffer.from(redeem, 'hex')).digest()).digest('hex').toString('hex');
    return base58check.encode(hash, '05');
};

function isMultisigAddress(address){
    return /^3[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
}

module.exports = {
    generate: generate,
    isMultisigAddress: isMultisigAddress,
    address: address
};