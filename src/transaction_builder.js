'use strict';
var Transaction = require('./transaction.js');
var Output = require('./output.js');

function TransactionBuilder() {}

/**
 * Generates a send (etp and or asset) transaction with the given utxos as inputs, assets and the change.
 * @param {Array<Output>} utxo Inputs for the transaction
 * @param {String} recipient_address Recipient address
 * @param {Object} target Definition of assets to send
 * @param {String} change_address Change address
 * @param {Object} change Definition of change assets
 */
TransactionBuilder.send = function(utxo, recipient_address, target, change_address, change, fee, messages) {
    return new Promise((resolve, reject) => {
        //Set fee
        if (fee == undefined)
            fee = Transaction.DEFAULT_FEE;
        var etpcheck = 0;
        //create new transaction
        let tx = new Transaction();
        //add inputs
        utxo.forEach((output) => {
            if (output.value)
                etpcheck += output.value;
            tx.addInput(output.address, output.hash, output.index, output.script);
        });
        if(messages==undefined)
            messages=[];
        messages.forEach((message)=>tx.addMessage(recipient_address, message));
        //add the target outputs to the recipient
        Object.keys(target).forEach((symbol) => (target.symbol)?tx.addOutput(recipient_address, symbol, target[symbol]):null);
        if (target.ETP)
            etpcheck -= target.ETP;
        //add the change outputs
        Object.keys(change).forEach((symbol) => tx.addOutput(change_address, symbol, -change[symbol]));
        if (change.ETP)
            etpcheck += change.ETP;
        if (etpcheck !== fee) throw Error('ERR_FEE_CHECK_FAILED');
        resolve(tx);
    });
};

/**
 * Generates an etp deposit transaction.
 * @param {Array<Output>} utxo Inputs for the transaction
 * @param {String} recipient_address Recipient address
 * @param {Number} quantity Quantity of ETP to deposit (in bits)
 * @param {Number} duration Number of blocks to freeze
 * @param {String} change_address Change address
 * @param {Object} change Definition of change assets
 * @param {Number} fee Optional fee definition (default 10000 bits)
 */
TransactionBuilder.deposit = function(utxo, recipient_address, quantity, duration, change_address, change, fee, network) {
    return new Promise((resolve, reject) => {
        //Set fee
        if (fee == undefined)
            fee = Transaction.DEFAULT_FEE;
        var etpcheck = 0;
        //create new transaction
        let tx = new Transaction();
        //add inputs
        utxo.forEach((output) => {
            if (output.value)
                etpcheck += output.value;
            tx.addInput(output.address, output.hash, output.index, output.script);
        });
        //add lock output to the recipient
        tx.addLockOutput(recipient_address, quantity, duration, network);
        etpcheck -= quantity;
        //add the change outputs
        Object.keys(change).forEach((symbol) => tx.addOutput(change_address, symbol, -change[symbol]));
        if (change.ETP)
            etpcheck += change.ETP;
        if (etpcheck !== fee) throw Error('ERR_FEE_CHECK_FAILED');
        resolve(tx);
    });
};

/**
 * Generates an asset issue transaction.
 * @param {Array<Output>} utxo Inputs for the transaction
 * @param {String} recipient_address Recipient address
 * @param {String} symbol Symbol of the new asset
 * @param {Number} max_supply The maximum supply of the asset
 * @param {Number} precision The number of decimal places
 * @param {String} issuer Public issuer name
 * @param {String} description Public description
 * @param {String} change_address Change address
 * @param {Object} change Definition of change assets
 * @param {Number} fee Optional fee definition (default 10000 bits)
 */
TransactionBuilder.issue = function(utxo, recipient_address, symbol, max_supply, precision, issuer, description, change_address, change) {
    return new Promise((resolve, reject) => {
        //Set fee
        const fee = 1000000000;
        var etpcheck = 0;
        //create new transaction
        let tx = new Transaction();
        //add inputs
        utxo.forEach((output) => {
            if (output.value)
                etpcheck += output.value;
            tx.addInput(output.address, output.hash, output.index, output.script);
        });
        //add lock output to the recipient
        tx.addAssetIssueOutput(symbol, max_supply, precision, issuer, recipient_address, description);
        //add the change outputs
        Object.keys(change).forEach((symbol) => tx.addOutput(change_address, symbol, -change[symbol]));
        if (change.ETP)
            etpcheck += change.ETP;
        if (etpcheck !== fee) throw Error('ERR_FEE_CHECK_FAILED');
        resolve(tx);
    });
};


module.exports = TransactionBuilder;
