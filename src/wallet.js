'use strict';

var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');
var Networks = require('./networks.js');
var Transaction = require('./transaction.js');
var Script = require('./script.js');
var Message = require('./message.js');

const DEFAULT_KEY_SEARCH_DEPTH = 250;

function Wallet() {
    this.rootnode = null;
}

Wallet.MNEMONIC_SIZE = 256;


/**
 * Generate a new mnemonic.
 * @return {Promise.String}
 */
Wallet.generateMnemonic = (wordlist) => {
    return new Promise((resolve) => {
        let mnemonic = bip39.generateMnemonic(Wallet.MNEMONIC_SIZE, wordlist);
        resolve(mnemonic);
    });
};

Wallet.validateMnemonic = (mnemonic, wordlist) => bip39.validateMnemonic(mnemonic, wordlist);

Wallet.wordlists = bip39.wordlists;

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

Wallet.findDeriveNodeByPublicKey = (node, pubkey, maxDepth) => {
    return Wallet.findDeriveIndexByPublicKey(node, pubkey, maxDepth)
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
 * For the given HD node it finds the derivative index thats corresponds to the given public key.
 * @param {HDNode} node Start node to
 * @param {String} pukey Target public key.
 * @param {Number} maxDepth Max index before algorithm stops.
 * @return {Promise.HDNode}
 */
Wallet.findDeriveIndexByPublicKey = (node, pubkey, maxDepth) => {
    return new Promise((resolve, reject) => {
        let i = 0,
            done = 0;
        if (maxDepth == undefined)
            maxDepth = DEFAULT_KEY_SEARCH_DEPTH;
        while (i < maxDepth && !done) {
            if (node.derive(i).getPublicKeyBuffer().toString('hex') == pubkey) {
                done++;
                resolve(i);
            }
            i++;
        }
        if (!done) {
            reject(Error('ERR_NO_HDNODE_FOR_PUBLICKEY'));
        }
    });
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
            maxDepth = DEFAULT_KEY_SEARCH_DEPTH;
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
 * Finds the wallets HD node that corresponds to the given public key.
 * @param {String} pubkey
 * @param {Number} maxDepth
 * @return {Promise.HDNode}
 */
Wallet.prototype.findDeriveNodeByPublicKey = function(pubkey, maxDepth) {
    return Wallet.findDeriveNodeByPublicKey(this.rootnode, pubkey, maxDepth);
};

/**
 * Finds the wallets HD node thats public key corresponds to the given address.
 * @param {String} address
 * @param {Number} maxDepth
 * @return {Promise.HDNode}
 */
Wallet.prototype.findPublicKeyByAddess = function(address, maxDepth) {
    return Wallet.findDeriveNodeByAddress(this.rootnode, address, maxDepth)
        .then(node => node.getPublicKeyBuffer().toString('hex'));
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
 * Gets the addresses of the wallet.
 * @param {Number} number number of addresses
 * @param {Number} start_from index to start from
 * @returns {Array<String>}
 */
Wallet.prototype.getAddresses = function(number, start_from) {
    if (start_from == undefined) start_from = 0;
    if (number == undefined) number = 10;
    let addresses = [];
    for (let i = 0; i < number; i++)
        addresses.push(this.getAddress(i));
    return addresses;
};

/**
 * Sign the given transaction.
 * @param {Transaction} transaction
 * @return{Promise.Transaction} Signed transaction.
 */
Wallet.prototype.sign = function(transaction) {
    return Promise.all(transaction.inputs.map((input, index) => this.generateInputScript(transaction, input, index)))
        .then((input_scripts) => Promise.all(input_scripts.map((script, index) => {
            transaction.inputs[index].script = script;
        })))
        .then(() => transaction);
};

/**
 * Sign the given transaction from multisig wallet.
 * @param {Transaction} transaction
 * @param {Multisig} multisig Multisignature wallet object
 * @return{Promise.Transaction} Signed transaction.
 */
Wallet.prototype.signMultisig = function(transaction, multisig) {
    return Promise.all(transaction.inputs.map((input, index) => this.generateInputScriptMultisig(transaction, input, index, multisig)))
        .then((input_scripts) => Promise.all(input_scripts.map((script, index) => {
            transaction.inputs[index].script = script;
        })))
        .then(() => transaction);
};

Wallet.prototype.signMessage = function(address, message, as_buffer) {
    if (typeof as_buffer === 'undefined')
        as_buffer = false;
    return this.findDeriveNodeByAddess(address)
        .then(node => Message.sign(message, node.keyPair.d.toBuffer(32), node.keyPair.compressed))
        .then(buffer => (as_buffer) ? buffer : buffer.toString('hex'));
};

/**
 * Generate input script (signature).
 * @param {Transaction} transaction
 * @param {String} input_address
 * @param {Number} index
 * @return {Promise.String}
 */
Wallet.prototype.generateInputScript = function(transaction, input, index) {
    return this.findDeriveNodeByAddess(input.address)
        .then((node) => Wallet.generateInputScriptParameters(node, transaction, index));
};

Wallet.prototype.generateInputScriptMultisig = function(transaction, input, index, multisig) {
    return this.findDeriveNodeByPublicKey(multisig.s)
        .then((node) => Wallet.generateInputScriptParametersMultisig(node, transaction, index, multisig.r));
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
        if (Script.isP2SH(transaction.inputs[index].previous_output.script))
            throw "Illegal script type P2SH";
        let unsigned_tx = transaction.clone().clearInputScripts().encode(index);
        let script_buffer = new Buffer(4);
        script_buffer.writeUInt32LE(1, 0);
        var prepared_buffer = Buffer.concat([unsigned_tx, script_buffer]);
        var sig_hash = bitcoin.crypto.sha256(bitcoin.crypto.sha256(prepared_buffer));
        let signature = hdnode.sign(sig_hash).toDER().toString('hex') + '01';
        let parameters = [Buffer.from(signature, 'hex'), hdnode.getPublicKeyBuffer()];
        //Check if the previous output was locked etp
        let lockregex = /^\[\ ([a-f0-9]+)\ \]\ numequalverify dup\ hash160\ \[ [a-f0-9]+\ \]\ equalverify\ checksig$/gi;
        if (transaction.inputs[index].previous_output.script && transaction.inputs[index].previous_output.script.match(lockregex)) {
            let number = lockregex.exec(transaction.inputs[index].previous_output.script.match(lockregex)[0])[1];
            parameters.push(Buffer.from(number, 'hex'));
        }
        resolve(parameters);
    });
};

Wallet.generateInputScriptParametersMultisig = function(hdnode, transaction, index, redeem) {
    return new Promise((resolve, reject) => {
        if (!Script.isP2SH(transaction.inputs[index].previous_output.script))
            throw "Illegal script type. Only P2SH is supported for multisignature signing";
        let unsigned_tx = transaction.clone().clearInputScripts().encode(index);
        let script_buffer = new Buffer(4);
        script_buffer.writeUInt32LE(1, 0);
        var prepared_buffer = Buffer.concat([unsigned_tx, script_buffer]);
        var sig_hash = bitcoin.crypto.sha256(bitcoin.crypto.sha256(prepared_buffer));
        let signature = hdnode.sign(sig_hash).toDER().toString('hex') + '01';
        let parameters = Script.extractP2SHSignatures(transaction.inputs[index].script);
        parameters.forEach(s=>{
            if(s==signature)
                throw "Signature already included";
        });
        parameters.push(signature);
        parameters.push(redeem);
        parameters=parameters.map(p=>Buffer.from(p,'hex'));
        parameters=[0].concat(parameters);
        resolve(parameters);
    });
};

module.exports = Wallet;
