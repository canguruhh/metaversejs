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
 * Generates an array of outputs that can be used to perform a transaction with the given requirements.
 * @param {Array<Output>} utxo
 * @param {Object} target definition
 */
TransactionBuilder.findUtxo = function(utxo, target) {
    return new Promise((resolve, reject) => {
        var change = JSON.parse(JSON.stringify(target));
        var list=[];
        utxo.forEach((output)=>{
            if(!targetComplete(change)&&change.ETP>0&&output.value>0){
                change.ETP-=output.value;
                if(output.attachment.type=='asset-transfer'||output.attachment.type=='asset-issue'){
                    if(change[output.attachment.symbol]==undefined)
                        change[output.attachment.symbol]=0;
                    change[output.attachment.symbol]-=output.attachment.quantity;
                }
                list.push(output);
            } else if(!targetComplete(change)){
                if((output.attachment.type=='asset-transfer'||output.attachment.type=='asset-issue')&&change[output.attachment.symbol]>0){
                    if(change[output.attachment.symbol]==undefined)
                        change[output.attachment.symbol]=0;
                    change[output.attachment.symbol]-=output.attachment.quantity;
                    if(output.value>0)
                        change.ETP-=output.value;
                }
                list.push(output);
            }
        });
        if(!targetComplete(change)) throw Error('ERR_INSUFFICIENT_UTXO');
        resolve({ utxo: list, change: change, target: target});
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
        if(fee==undefined)
            fee=10000;
        target["ETP"]-=fee;
        //create new transaction
        let tx = new Transaction();
        //add inputs
        utxo.forEach((output) => tx.addInput(output.address, output.hash, output.index));
        //add the target outputs to the recipient
        Object.keys(target).forEach((symbol)=>tx.addOutput(recipient_address,symbol,target[symbol]));
        //add the change outputs
        Object.keys(change).forEach((symbol)=>tx.addOutput(change_address,symbol,-change[symbol]));
        resolve(tx);
    });
};
/**
 * Helper function to check a target object if there are no more positive values.
 * @param {Object} targets
 * @returns {Boolean}
 */
function targetComplete(target) {
    let complete=true;
    Object.values(target).forEach((value)=>{
        if(value>0)
            complete=false;
    });
    return complete;
}

module.exports = TransactionBuilder;
