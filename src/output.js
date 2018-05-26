Output.ATTACHMENT_VERSION_DEFAULT = 1;
Output.ATTACHMENT_VERSION_DID = 207;

const DEFAULT_FEE=10000;

function Output(){
    this.address=null;
    this.attachment={
        version: Output.ATTACHMENT_VERSION_DEFAULT
    };
    this.value=0;
    this.script_type="pubkeyhash";
}

Output.prototype.specifyDid = function(to_did, from_did){
    this.attachment.version=Output.ATTACHMENT_VERSION_DID;
    this.attachment.to_did=to_did;
    this.attachment.from_did=from_did;
    return this;
};

/**
 * Filters the given outputs by the given inputs. Return the unspent transaction outputs.
 * @param {Array<Output>} outputs
 * @param {Array<Input>} inputs
 * @return {Promise.Array<Output>}
 */
Output.filterUtxo = function(outputs, inputs) {
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
Output.calculateUtxo = function(txs, addresses) {
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
Output.findUtxo = function(utxo, target, current_height, fee) {
    target = JSON.parse(JSON.stringify(target));
    return new Promise((resolve, reject) => {
        //Add fee
        if (fee == undefined)
            fee = DEFAULT_FEE;
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
 * Filters the given outputs with the given filter.
 * @param {Array<Output>} outputs
 * @param {Object} filter
 * @return {Array<Output>}
 */
Output.filter=function(outputs, filter){
    return outputs.filter(output=>{
        if(filter.type !== undefined){
            if(filter.type!==output.attachment.type)
                return false;
        }
        return true;
    });
}

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

module.exports = Output;
