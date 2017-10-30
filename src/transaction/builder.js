'use strict';
var Transaction = require('./index.js');
var request = require('request');

const HOST = 'https://explorer.mvs.org/api/';

function TransactionBuilder() {}

TransactionBuilder.prototype.getUtxo = function(addresses) {
    return TransactionBuilder.getInOuts(addresses)
}

TransactionBuilder.getInOuts = function(addresses) {
    return new Promise((resolve, reject) => {
        var string = HOST + 'inouts?';
        addresses.forEach((address) => {
            string += 'addresses[]=' + address;
        });
        request(string, function(err, response, body) {
            if (err)
                reject(Error('ERR_FETCH_IO'));
            else
                resolve(body);
        });
    });
}

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
                            ins=ins.splice(index,1);
                            spent = 1;
                        }
                    });
                if (!spent)
                    utxo.push(output);
            });
        }
        resolve(utxo);
    });
}

TransactionBuilder.findUtxo = function(utxo, asset, value, fee = Transaction.DEFAULT_FEE) {
    return new Promise((resolve, reject) => {
        let outputs = [];
        let target = {};
        target[asset] = value;
        if (asset === 'ETP') {
            target[asset] += fee;
        } else {
            target['ETP'] = fee;
        }
        let i = 0;
        while (!targetComplete(target) && i < utxo.length) {
            if (target[utxo[i].asset] !== undefined && target[utxo[i].asset] > 0) {
                outputs.push(utxo[i]);
                target[utxo[i].asset] -= utxo[i].value;
            }
            i++;
        };
        if (targetComplete(target)) {
            resolve({
                outputs: outputs,
                change: target
            });
        } else {
            reject(Error('ERR_INSUFFICIENT_BALANCE'));
        }
    });
};

function targetComplete(targets) {
    let complete = 1;
    Object.keys(targets).forEach((key) => {
        if (targets[key] > 0) {
            complete = 0;
        }
    });
    return complete;
}



module.exports = TransactionBuilder;
