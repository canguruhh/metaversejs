const Script = require('./script');

Output.ATTACHMENT_VERSION_DEFAULT = 1;
Output.ATTACHMENT_VERSION_DID = 207;

Output.ATTACHMENT_TYPE_ETP_TRANSFER = 0;
Output.ATTACHMENT_TYPE_ASSET = 2;
Output.ATTACHMENT_TYPE_MESSAGE = 3;
Output.ATTACHMENT_TYPE_DID = 4;
Output.ATTACHMENT_TYPE_CERT = 5;

Output.ASSET_STATUS_ISSUE = 1;
Output.ASSET_STATUS_TRANSFER = 2;

Output.CERT_ISSUE = 1;
Output.CERT_DOMAIN = 2;
Output.CERT_NAMING = 3;

Output.CERT_STATUS_DEFAULT = 0;
Output.CERT_STATUS_ISSUE = 1;
Output.CERT_STATUS_TRANSFER = 2;

Output.AVATAR_STATUS_ISSUE = 1;
Output.AVATAR_STATUS_TRANSFER = 2;

const DEFAULT_FEE = 10000;

function Output() {
    this.address = null;
    this.attachment = {
        version: Output.ATTACHMENT_VERSION_DEFAULT
    };
    this.value = 0;
    this.script_type = "pubkeyhash";
}

Output.prototype.setTransfer = function(address, value) {
    this.address = address;
    this.attachment.type = Output.ATTACHMENT_TYPE_MESSAGE;
    this.script_type = "pubkeyhash";
    return this;
};

Output.prototype.setAssetTransfer = function(address, symbol, quantity) {
    this.address = address;
    this.attachment.type = Output.ATTACHMENT_TYPE_ASSET;
    this.attachment.asset = symbol;
    this.attachment.quantity = quantity;
    this.attachment.status = Output.ASSET_STATUS_TRANSFER;
    return this;
};

Output.prototype.setAssetIssue = function(symbol, max_supply, precision, issuer, address, description, secondaryissue_threshold, is_secondaryissue) {
    this.address = address;
    this.attachment.type = Output.ATTACHMENT_TYPE_ASSET;
    this.attachment.status = Output.ASSET_STATUS_ISSUE;
    this.attachment.symbol = symbol;
    this.attachment.secondaryissue_threshold = secondaryissue_threshold + ((is_secondaryissue || secondaryissue_threshold == -1) ? 128 : 0);
    this.attachment.max_supply = max_supply;
    this.attachment.precision = precision;
    this.attachment.issuer = issuer;
    this.attachment.address = address;
    this.attachment.description = description;
    return this;
};

Output.prototype.setTransfer = function(address, value) {
    this.address = address;
    this.attachment.type = Output.ATTACHMENT_TYPE_ETP_TRANSFER;
    this.value = value;
    return this;
};

Output.prototype.setMessage = function(address, message) {
    this.address = address;
    this.attachment.type = Output.ATTACHMENT_TYPE_MESSAGE;
    this.attachment.message = message;
    return this;
};

Output.prototype.setDeposit = function(address, value, locktime) {
    this.address = address;
    this.attachment.type = Output.ATTACHMENT_TYPE_ETP_TRANSFER;
    this.value = value;
    this.locktime = locktime;
    this.script_type = "lock";
    return this;
};

Output.prototype.setIdentityIssue = function(address, symbol, did_address) {
    if (did_address == undefined)
        did_address = address;
    this.address = address;
    this.attachment.type = Output.ATTACHMENT_TYPE_DID;
    this.attachment.symbol = symbol;
    this.attachment.address = did_address;
    this.attachment.status = Output.AVATAR_STATUS_ISSUE;
    return this;
};

Output.prototype.setIdentityTransfer = function(address, symbol, did_address) {
    if (did_address == undefined)
        did_address = address;
    this.address = address;
    this.attachment.type = Output.ATTACHMENT_TYPE_DID;
    this.attachment.symbol = symbol;
    this.attachment.address = did_address;
    this.attachment.status = Output.AVATAR_STATUS_TRANSFER;
    return this;
};

Output.prototype.setIdentityTransfer = function(address, value) {
    this.address = address;
    this.attachment.type = Output.ATTACHMENT_TYPE_ETP_TRANSFER;
    this.value = value;
    return this;
};

Output.prototype.setCert = function(symbol, owner, address, cert, status) {
    this.address = address;
    this.attachment.type = Output.ATTACHMENT_TYPE_CERT;
    this.attachment.owner = owner;
    this.attachment.symbol = symbol;
    switch ((typeof cert == 'string') ? cert.toLowerCase() : cert) {
        case 'domain':
            this.attachment.cert = Output.CERT_DOMAIN;
            break;
        case 'issue':
            this.attachment.cert = Output.CERT_ISSUE;
            break;
        case 'naming':
            this.attachment.cert = Output.CERT_NAMING;
            break;
        default:
            throw ('ERR_UNKNOWN_CERT');
    }
    switch ((typeof status == 'string') ? status.toLowerCase() : status) {
        case 'issue':
            this.attachment.status = Output.CERT_STATUS_ISSUE;
            break;
        case 'naming':
            this.attachment.status = Output.CERT_STATUS_TRANSFER;
            break;
        default:
            if (typeof status == 'number')
                this.attachment.status = status;
            else
                this.attachment.status = Output.CERT_STATUS_DEFAULT;
    }
    this.attachment.address = address;
    this.attachment.status = status;
    return this;
};

Output.prototype.specifyDid = function(to_did, from_did) {
    this.attachment.version = Output.ATTACHMENT_VERSION_DID;
    this.attachment.to_did = to_did;
    this.attachment.from_did = from_did;
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
                        if (output.locked_until <= current_height && change.ETP > 0 && output.value > 0) {
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
Output.filter = function(outputs, filter) {
    return outputs.filter(output => {
        if (filter.type !== undefined) {
            if (!Array.isArray(filter.type) && filter.type !== output.attachment.type)
                return false;
            else if (Array.isArray(filter.type) && filter.type.indexOf(output.attachment.type) == -1)
                return false;
        }
        if (filter.symbol !== undefined) {
            if (!Array.isArray(filter.symbol) && filter.symbol !== output.symbol)
                return false;
            else if (Array.isArray(filter.symbol) && filter.type.indexOf(output.symbol) == -1)
                return false;
        }
        if (filter.address !== undefined) {
            if (!Array.isArray(filter.address) && filter.address !== output.address)
                return false;
            else if (Array.isArray(filter.address) && filter.address.indexOf(output.address) == -1)
                return false;
        }
        return true;
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

Output.assetSpendable = function(output, tx_height, current_height) {
    switch (output.attachment.type) {
        case 'asset-transfer':
        case 'asset-issue':
            break;
        default:
            throw Error('ERR_TYPE_NOT_APPLICABLE');
    }
    if (Script.hasAttenuationModel(output.script)) {
        let model = Script.deserializeAttenuationModel(Script.getAttenuationModel(output.script));
        switch (model.TYPE) {
            case 1:
            return Math.max(0,output.attachment.quantity - model.LQ + Math.min(Math.floor((current_height - tx_height) / (model.LP / model.UN)), model.UN) * (model.LQ / model.UN));
            case 2:
            case 3:
                return 0;
        }
    } else {
        return output.attachment.quantity;
    }
};

module.exports = Output;
