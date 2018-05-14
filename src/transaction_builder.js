'use strict';
var Transaction = require('./transaction.js');

function TransactionBuilder() {}

/**
 * Filters the given outputs by the given inputs. Return the unspent transaction outputs.
 * @param {Array<Output>} outputs
 * @param {Array<Input>} inputs
 * @return {Promise.Array<Output>}
 */
TransactionBuilder.filterUtxo = function(outputs, inputs) {
    return new Promise((resolve, reject) => {
        let ins = JSON.parse(JSON.stringify(inputs));
        let utxo = [];
        if (outputs.length) {
            outputs.forEach((output, oindex) => {
                let spent = 0;
                if (ins.length)
                    ins.forEach((input, index) => {
                        if (!spent && input.belong_tx_id == output.tx_id && input.output_index == output.index) {
                            spent = 1;
                        }
                    });
                if (!spent)
                    utxo.push(output);
            });
        }
        resolve(utxo);
    });
};

/**
 * Generates an array of unspent outputs calculated by the given transactions and addresses.
 * @param {Array<Transaction>} transactions
 * @param {Array<string>} addresses
 */
TransactionBuilder.calculateUtxo = function(txs, addresses) {
    return new Promise((resolve) => {
        let candidates = {};
        for (let i = txs.length - 1; i >= 0; i--) {
            //Search received outputs
            txs[i].outputs.forEach((output) => {
                if (addresses.indexOf(output.address) !== -1) {
                    output.locked_until = (output.locked_height_range) ? txs[i].height + output.locked_height_range : 0;
                    delete output['locked_height_range'];
                    output.hash = txs[i].hash;
                    candidates[txs[i].hash + '-' + output.index] = output;
                }
            });
            //Remove spent outputs if matching input is found
            txs[i].inputs.forEach((input) => {
                if (addresses.indexOf(input.address) !== -1) {
                    if (candidates[input.previous_output.hash + '-' + input.previous_output.index]) {
                        delete candidates[input.previous_output.hash + '-' + input.previous_output.index];
                    } else throw Error('Found input without matching output');
                }
            });
        }
        resolve(Object.values(candidates));
    });
}

/**
 * Generates an array of outputs that can be used to perform a transaction with the given requirements.
 * @param {Array<Output>} utxo
 * @param {Object} target definition
 */
TransactionBuilder.findUtxo = function(utxo, target, current_height, fee) {
    target = JSON.parse(JSON.stringify(target));
    return new Promise((resolve, reject) => {
        //Add fee
        if (fee == undefined)
            fee = Transaction.DEFAULT_FEE;
        if (target["ETP"])
            target.ETP += fee;
        else
            target.ETP = fee;

        var change = JSON.parse(JSON.stringify(target));
        var list = [];
        utxo.forEach((output) => {
            if (!targetComplete(change)) {
                switch (output.attachment.type) {
                    case 'etp':
                        if (output.locked_until<=current_height && change.ETP > 0 && output.value > 0) {
                            change.ETP -= output.value;
                            list.push(output);
                        }
                        break;
                    case 'asset-transfer':
                    case 'asset-issue':
                        if ((change.ETP > 0 && output.value > 0) || (target[output.attachment.symbol] > 0 && output.attachment.quantity > 0)) {
                            change.ETP -= output.value;
                            if (change[output.attachment.symbol] == undefined)
                                change[output.attachment.symbol] = 0;
                            change[output.attachment.symbol] -= output.attachment.quantity;
                            list.push(output);
                        }
                        break;
                }
            }
        });
        if (!targetComplete(change)) throw Error('ERR_INSUFFICIENT_UTXO');
        resolve({
            utxo: list,
            change: change,
            selected: target
        });
    });
};

/**
 * Generates a send (etp and or asset) transaction with the given utxos as inputs, assets and the change.
 * @param {Array<Output>} utxo Inputs for the transaction
 * @param {String} recipient_address Recipient address
 * @param {Object} target Definition of assets to send
 * @param {String} change_address Change address
 * @param {Object} change Definition of change assets
 */
TransactionBuilder.send = function(utxo, recipient_address, target, change_address, change, fee) {
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
        //add the target outputs to the recipient
        Object.keys(target).forEach((symbol) => tx.addOutput(recipient_address, symbol, target[symbol]));
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

/**
 * Helper function to check a target object if there are no more positive values.
 * @param {Object} targets
 * @returns {Boolean}
 */
function targetComplete(target) {
    let complete = true;
    Object.values(target).forEach((value) => {
        if (value > 0)
            complete = false;
    });
    return complete;
}

module.exports = TransactionBuilder;
