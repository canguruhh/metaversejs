var base58check = require('base58check');
let bitcoinjs = require('bitcoinjs-lib');
var crypto = require('crypto');
var assert = require('assert')
var Script = require('./script')
var ripemd160 = require('ripemd160');
var OPS = require('metaverse-ops');

function generate(m, pubKeys) {
    let script = redeem(m, pubKeys);
    return {
        script: script,
        address: address(script)
    };
}

function fromRedeem(redeem) {
    redeem = Buffer.isBuffer(redeem) ? redeem : Buffer.from(redeem, 'hex');
    var chunks = Script.fromBuffer(redeem).chunks;
    assert(chunks.pop()==OPS.OP_CHECKMULTISIG, 'Redeem script must check multisig');
    var k = [];
    var n = chunks.pop()-OPS.OP_RESERVED;
    for(var i=0;i<n;i++){
        k.push(chunks.pop());
    }
    k=k.reverse();
    var m = chunks.pop()-OPS.OP_RESERVED;
    assert(chunks.length===0, 'Invalid redeem script');
    return {
        m,n,k,r: redeem.toString('hex')
    }
}

function redeem(m, pubKeys) {
    return bitcoinjs.script.multisig.output.encode(m, pubKeys.map(key => Buffer.from(key, 'hex')).sort()).toString('hex');
};

function address(redeem) {
    var hash = new ripemd160().update(crypto.createHash('sha256').update(Buffer.from(redeem, 'hex')).digest()).digest('hex').toString('hex');
    return base58check.encode(hash, '05');
};

function getSignatureStatus(transaction, inputIndex, redeem, network, targetPublicKey) {

    // Extract the existing signatures from the input script
    var signatures = Script.extractP2SHSignatures(transaction.inputs[inputIndex].script)
        .map(string => bitcoinjs.ECSignature.fromDER(Buffer.from(string.substr(0, string.length - 2), 'hex')))

    //Get public keys from redeem script
    var multisigConfig = fromRedeem(redeem);

    // Calculate the transaction signature hash for the given index 
    var unsigned_tx = transaction.clone().clearInputScripts();
    unsigned_tx.inputs[inputIndex].redeem = redeem;
    unsigned_tx = unsigned_tx.encode(inputIndex);
    var prepared_buffer = Buffer.concat([unsigned_tx, Buffer.from('01000000', 'hex')]);
    var sig_hash = bitcoinjs.crypto.sha256(bitcoinjs.crypto.sha256(prepared_buffer));

    var targetSigned = false;
    var numberOfSignatures = 0;
    var signatureMap = multisigConfig.k.map(pulicKeyBuffer => {
        var ecPair = bitcoinjs.ECPair.fromPublicKeyBuffer(pulicKeyBuffer, network)
        for (var i = 0; i < signatures.length; i++) {
            if (ecPair.verify(sig_hash, signatures[i])){
                if(targetPublicKey && !targetSigned && pulicKeyBuffer.toString('hex')===targetPublicKey){
                    targetSigned=true;
                }
                numberOfSignatures++;
                return i;
            }
        }
        return -1;
    });

    var result = {
        complete: numberOfSignatures>=multisigConfig.m,
        signatureMap,
    }

    if(targetPublicKey){
        result.targetSigned = targetSigned;
    }

    return result;
}

function isMultisigAddress(address) {
    return /^3[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
}

module.exports = {
    generate,
    isMultisigAddress,
    address,
    publicKeysFromRedeem: fromRedeem,
    getSignatureStatus,
};
