'use strict';

var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');
var Networks = require('./networks.js');


function Wallet() {
    this.rootnode = null;
}

Wallet.MNEMONIC_SIZE = 256;


/**
 * Generate a new mnemonic.
 * @return {Promise.String}
 */
Wallet.generateMnemonic = () => {
    return new Promise((resolve) => {
        let mnemonic = bip39.generateMnemonic(Wallet.MNEMONIC_SIZE);
        resolve(mnemonic);
    });
};

/**
 * Generates a seed from the given mnemonic.
 * @param String mnemonic
 * @return {Promise.Buffer} Seed for wallet generation.
 */
Wallet.mnemonicToSeed = (mnemonic) => {
    return new Promise((resolve) => {
        let seed = bip39.mnemonicToSeed(mnemonic);
        resolve(seed);
    });
};

/**
 * Generates a new wallet from the given seed.
 * @param {Buffer} seed
 * @param {network} network (optional)
 * @return {Promise.Wallet}
 */
Wallet.fromSeed = (seed, network) => {
    return new Promise((resolve) => {
        let wallet = new Wallet();
        wallet.rootnode = bitcoin.HDNode.fromSeedBuffer(seed, network);
        resolve(wallet);
    });
};

/**
 * Generates a new wallet from the given mnemonic.
 * @param {String} mnemonic Menmonic words
 * @param {network} network (optional)
 * @return {Promise.Wallet}
 */
Wallet.fromMnemonic = (mnemonic, network) => {
    if (network == undefined)
        network = 'mainnet';
    if (Networks[network] == undefined)
        throw "illegal network";
    return Wallet.mnemonicToSeed(mnemonic)
        .then((seed) => Wallet.fromSeed(seed, Networks[network]));
};

/**
 * Finds the hd node thats public key corresponds to the given address.
 * @param {HDNode} node Start node to
 * @param {String} address Target address.
 * @param {Number} maxDepth Max index before algorithm stops.
 * @return {Promise.HDNode}
 */
Wallet.findDeriveNodeByAddress = (node, address, maxDepth) => {
    return Wallet.findDeriveIndexByAddress(node, address, maxDepth)
        .then((index) => node.derive(index));
};

/**
 * Finds the wallets HD index thats public key corresponds to the given address.
 * @param {String} address
 * @param {Number} maxDepth
 * @return {Promise.Number}
 */
Wallet.prototype.findDeriveIndexByAddress = function(address, maxDepth) {
    return Wallet.findDeriveIndexByAddress(this.rootnode, address, maxDepth);
};

/**
 * For the given HD node it finds the derivative index thats public key corresponds to the given address.
 * @param {HDNode} node Start node to
 * @param {String} address Target address.
 * @param {Number} maxDepth Max index before algorithm stops.
 * @return {Promise.HDNode}
 */
Wallet.findDeriveIndexByAddress = (node, address, maxDepth) => {
    return new Promise((resolve, reject) => {
        let i = 0,
            done = 0;
        if (maxDepth == undefined)
            maxDepth = 50;
        while (i < maxDepth && !done) {
            if (node.derive(i).getAddress() == address) {
                done++;
                resolve(i);
            }
            i++;
        }
        if (!done) {
            reject(Error('ERR_NO_HDNODE_FOR_ADDRESS'));
        }
    });
};

/**
 * Finds the wallets HD node thats public key corresponds to the given address.
 * @param {String} address
 * @param {Number} maxDepth
 * @return {Promise.HDNode}
 */
Wallet.prototype.findDeriveNodeByAddess = function(address, maxDepth) {
    return Wallet.findDeriveNodeByAddress(this.rootnode, address, maxDepth);
};

/**
 * Gets the address for the given hd index of the wallet.
 * @param {Number} index
 * @returns {String}
 */
Wallet.prototype.getAddress = function(index) {
    if (index == undefined) index = 0;
    return this.rootnode.derive(index).getAddress();
};

/**
 * Sign the given transaction.
 * @param {Transaction} transaction
 * @return{Promise.Transaction} Signed transaction.
 */
Wallet.prototype.sign = function(transaction) {
    return Promise.all(transaction.inputs.map((input, index) => this.generateInputScript(transaction, input.address, index)))
        .then((input_scripts) => Promise.all(input_scripts.map((script, index) => {
            transaction.inputs[index].script = script;
        })))
        .then(()=>transaction);
};

/**
 * Generate input script (signature).
 * @param {Transaction} transaction
 * @param {String} input_address
 * @param {Number} index
 * @return {Promise.String}
 */
Wallet.prototype.generateInputScript = function(transaction, input_address, index) {
    return this.findDeriveNodeByAddess(input_address)
        .then((node) => Wallet.generateInputScriptParameters(node, transaction, index));
};

/**
 * Generate input script (signature) for the transactions input with the given index.
 * @param {HDNode} node HD node used for signature
 * @param {Transaction} transaction
 * @param {Number} index
 * @return {Promise.String}
 */
Wallet.generateInputScriptParameters = function(hdnode, transaction, index) {
    return new Promise((resolve, reject) => {
        let unsigned_tx = transaction.clone().clearInputScripts().encode(index);
        let script_buffer = new Buffer(4);
        script_buffer.writeUInt32LE(1, 0);
        var prepared_buffer = Buffer.concat([unsigned_tx, script_buffer]);
        var sig_hash = bitcoin.crypto.sha256(bitcoin.crypto.sha256(prepared_buffer));
        let signature = hdnode.sign(sig_hash).toDER().toString('hex')+'01';
        let parameters = [Buffer.from(signature,'hex'),hdnode.getPublicKeyBuffer() ];
        //Check if the previous output was locked etp
        let lockregex = /^\[\ ([a-f0-9]+)\ \]\ numequalverify dup\ hash160\ \[ [a-f0-9]+\ \]\ equalverify\ checksig$/gi;
        if(transaction.inputs[index].previous_output.script && transaction.inputs[index].previous_output.script.match(lockregex)){
            let number = lockregex.exec(transaction.inputs[index].previous_output.script.match(lockregex)[0])[1];
            parameters.push(number);
        }
        resolve(parameters);
    });
};

module.exports = Wallet;
