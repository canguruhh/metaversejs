'use strict';

var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');

var Transaction = require('../transaction');

var Networks = require('../networks.js');

const MNEMONIC_SIZE = 256;

function Wallet() {
    this.rootnode = null;
}

Wallet.generateMnemonic = () => {
    return new Promise((resolve) => {
        let mnemonic = bip39.generateMnemonic(MNEMONIC_SIZE);
        resolve(mnemonic);
    });
}

Wallet.mnemonicToSeed = (mnemonic) => {
    return new Promise((resolve) => {
        let seed = bip39.mnemonicToSeed(mnemonic);
        resolve(seed);
    });
}

Wallet.fromSeed = (seed, network) => {
    return new Promise((resolve) => {
        let wallet = new Wallet();
        wallet.rootnode = bitcoin.HDNode.fromSeedBuffer(seed, network);
        resolve(wallet);
    });
}

Wallet.fromMnemonic = (mnemonic, network) => {
    if(network==undefined)
        network='mainnet';
    if(Networks[network]==undefined)
        throw "illegal network"
    return Wallet.mnemonicToSeed(mnemonic)
        .then((seed) => Wallet.fromSeed(seed, Networks[network]));
}

Wallet.findDeriveNodeByAddress = (node, address, maxDepth) => {
    return Wallet.findDeriveIndexByAddress(node, address, maxDepth)
        .then((index) => node.derive(index));
};

Wallet.prototype.findDeriveIndexByAddress = function(address, maxDepth) {
    return Wallet.findDeriveIndexByAddress(this.rootnode, address, maxDepth);
}

Wallet.prototype.getAddress = function(index) {
    if (index == undefined) index = 0;
    return this.rootnode.derive(index).getAddress();
}

Wallet.prototype.findDeriveNodeByAddess = function(address, maxDepth) {
    return Wallet.findDeriveNodeByAddress(this.rootnode, address, maxDepth);
}

Wallet.prototype.sign = function(tx) {
    return Promise.all(tx.inputs.map((input, index) => {
        return this.findDeriveNodeByAddess(input.address)
            .then((node) => {
                //TODO: Cleanup this mess
                let tmptx = Object.create(tx);
                tmptx.clearInputScripts();
                let unsigned_tx = tmptx.encode(index);
                let script_buffer = new Buffer(4);
                script_buffer.writeUInt32LE(1, 0);
                var prepared_buffer = Buffer.concat([unsigned_tx, script_buffer]);
                var sig_hash = bitcoin.crypto.sha256(bitcoin.crypto.sha256(prepared_buffer));
                let sig = node.sign(sig_hash);
                return "[ " + sig.toDER().toString('hex') + "01 ] [ " + node.getPublicKeyBuffer().toString('hex') + " ]";
            });
    })).then((input_scripts) => {
        input_scripts.forEach((script, index) => {
            tx.inputs[index].script = script;
        });
        return tx;
    });
}

Wallet.findDeriveIndexByAddress = (node, address, maxDepth) => {
    return new Promise((resolve, reject) => {
        let i = 0,
            done = 0;
        if (maxDepth == undefined)
            maxDepth = 50;
        while (i < maxDepth && !done) {
            if (node.derive(i).getAddress() == address) {
                done++;
                resolve(i)
            }
            i++;
        }
        if (!done) {
            reject(Error('ERR_NO_HDNODE_FOR_ADDRESS'));
        }
    });
}

module.exports = Wallet;
