const Script = require('./script'),
    Constants = require('./constants');

class Output {

    constructor() {
        this.address = null;
        this.attachment = {
            version: Constants.ATTACHMENT.VERSION.DEFAULT
        };
        this.value = 0;
        this.script_type = "pubkeyhash";
    }

    setTransfer(address, value) {
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.MESSAGE;
        this.script_type = "pubkeyhash";
        return this;
    };

    setMITRegister(address, symbol, content) {
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.MIT;
        this.attachment.symbol = symbol;
        this.attachment.address = address;
        this.attachment.content = content;
        this.attachment.status = Constants.MST.STATUS.REGISTER;
        return this;
    };

    setMITTransfer(address, symbol) {
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.MIT;
        this.attachment.symbol = symbol;
        this.attachment.address = address;
        this.attachment.status = Constants.MST.STATUS.TRANSFER;
        return this;
    };

    setBurn(){
        this.script_type='op_return';
        return this;
    }

    setAssetTransfer(address, symbol, quantity) {
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.MST;
        this.attachment.symbol = symbol;
        this.attachment.quantity = quantity;
        this.attachment.status = Constants.MST.STATUS.TRANSFER;
        return this;
    };

    setAttenuation(attenuation_model, height_delta, from_tx, from_index) {
        this.attenuation = {
            model: attenuation_model,
            height_delta: height_delta,
            from_tx: from_tx,
            from_index: from_index
        };
        this.script_type = 'attenuation';
        return this;
    };

    setAssetIssue(symbol, max_supply, precision, issuer, address, description, secondaryissue_threshold, is_secondaryissue) {
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.MST;
        this.attachment.status = Constants.MST.STATUS.REGISTER;
        this.attachment.symbol = symbol;
        this.attachment.secondaryissue_threshold = secondaryissue_threshold + ((is_secondaryissue || secondaryissue_threshold == -1) ? 128 : 0);
        this.attachment.max_supply = max_supply;
        this.attachment.precision = precision;
        this.attachment.issuer = issuer;
        this.attachment.address = address;
        this.attachment.description = description;
        return this;
    };

    setTransfer(address, value) {
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.ETP_TRANSFER;
        this.value = value;
        return this;
    };

    setMessage(address, message) {
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.MESSAGE;
        this.attachment.message = message;
        return this;
    };

    setP2SH() {
        this.script_type = "p2sh";
        return this;
    };

    setDeposit(address, value, locktime) {
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.ETP_TRANSFER;
        this.value = value;
        this.locktime = locktime;
        this.script_type = "lock";
        return this;
    };

    setIdentityIssue(address, symbol, did_address) {
        if (did_address == undefined)
            did_address = address;
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.AVATAR;
        this.attachment.symbol = symbol;
        this.attachment.address = did_address;
        this.attachment.status = Constants.AVATAR.STATUS.REGISTER;
        return this;
    };

    setIdentityTransfer(address, symbol, did_address) {
        if (did_address == undefined)
            did_address = address;
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.AVATAR;
        this.attachment.symbol = symbol;
        this.attachment.address = did_address;
        this.attachment.status = Constants.AVATAR.STATUS.TRANSFER;
        return this;
    };

    setIdentityTransfer(address, value) {
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.ETP_TRANSFER;
        this.value = value;
        return this;
    };

    setCert(symbol, owner, address, cert, status, content) {
        this.address = address;
        this.attachment.type = Constants.ATTACHMENT.TYPE.CERT;
        this.attachment.owner = owner;
        this.attachment.symbol = symbol;
        this.attachment.content = content;
        switch ((typeof cert == 'string') ? cert.toLowerCase() : cert) {
            case 'domain':
                this.attachment.cert = Constants.CERT.TYPE.DOMAIN;
                break;
            case 'issue':
                this.attachment.cert = Constants.CERT.TYPE.ISSUE;
                break;
            case 'naming':
                this.attachment.cert = Constants.CERT.TYPE.NAMING;
                break;
            case 'mining':
                this.attachment.cert = Constants.CERT.TYPE.MINING;
                break;
            default:
                throw ('ERR_UNKNOWN_CERT');
        }
        switch ((typeof status == 'string') ? status.toLowerCase() : status) {
            case 'issue':
                this.attachment.status = Constants.CERT.STATUS.ISSUE;
                break;
            case 'transfer':
                this.attachment.status = Constants.CERT.STATUS.TRANSFER;
                break;
            case 'autoissue':
                this.attachment.status = Constants.CERT.STATUS.AUTOISSUE;
                break;
            default:
                if (typeof status == 'number')
                    this.attachment.status = status;
                else
                    this.attachment.status = Constants.CERT.STATUS.DEFAULT;
        }
        this.attachment.address = address;
        return this;
    };

    specifyDid(to_did, from_did) {
        this.attachment.version = Constants.ATTACHMENT.VERSION.DID;
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
    static filterUtxo(outputs, inputs) {
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
    static calculateUtxo(txs, addresses) {
        return new Promise((resolve) => {
            let list = {};
            txs.forEach((tx, index) => {
                tx.inputs.forEach((input) => {
                    list[input.previous_output.hash + '-' + input.previous_output.index] = 'spent';
                });
                tx.outputs.forEach((output) => {
                    if (addresses.indexOf(output.address) !== -1 && list[tx.hash + '-' + output.index] !== 'spent') {
                        output.locked_until = (output.locked_height_range) ? tx.height + output.locked_height_range : 0;
                        delete output['locked_height_range'];
                        output.hash = tx.hash;
                        list[tx.hash + '-' + output.index] = output;
                    }
                });
            });
            let utxo = [];
            Object.values(list).forEach(item => {
                if (item !== 'spent')
                    utxo.push(item);
            });
            resolve(utxo);
        });
    }

    /**
     * Generates an array of outputs that can be used to perform a transaction with the given requirements.
     * @param {Array<Output>} utxo
     * @param {Object} target definition
     */
    static findUtxo(utxo, originalTarget, current_height, fee = Constants.FEE.DEFAULT, useLargestEtpUtxo = false) {
        const target = JSON.parse(JSON.stringify(originalTarget));
        return new Promise((resolve, reject) => {
            //Add fee
            if (target["ETP"])
                target.ETP += fee;
            else
                target.ETP = fee;

            var change = JSON.parse(JSON.stringify(target));
            var lockedAssetChange = [];
            var list = [];

            if (useLargestEtpUtxo) {
                utxo = utxo.sort(function (a, b) {
                    return b.value - a.value;
                })
            }

            utxo.forEach((output) => {
                if (!targetComplete(change)) {
                    // prepare output locking information
                    if (output.locked_until === undefined &&
                        output.locked_height_range !== undefined &&
                        output.height !== undefined
                    ) {
                        output.locked_until = output.height + output.locked_height_range;
                    }
                    if (output.previous_output === undefined) {
                        output.previous_output = {
                            hash: output.tx,
                            index: output.index,
                            script: output.script,
                        };
                    }
                    if(output.hash===undefined && output.tx!==undefined){
                        output.hash=output.tx;
                    }
                    switch (output.attachment.type) {
                        case 'etp':
                            if ( current_height==undefined || output.locked_until <= current_height && change.ETP > 0 && output.value > 0) {
                                change.ETP -= output.value;
                                list.push(output);
                            }
                            break;
                        case 'asset-transfer':
                        case 'asset-issue':
                            if ((change.ETP > 0 && output.value > 0) || (change[output.attachment.symbol] > 0 && Output.assetSpendable(output, output.height, current_height) > 0)) {
                                change.ETP -= output.value;
                                if (change[output.attachment.symbol] == undefined)
                                    change[output.attachment.symbol] = 0;
                                change[output.attachment.symbol] -= Output.assetSpendable(output, output.height, current_height);
                                if (output.attachment.quantity > Output.assetSpendable(output, output.height, current_height)) {
                                    let lockChange = {
                                        symbol: output.attachment.symbol,
                                        quantity: output.attachment.quantity - Output.assetSpendable(output, output.height, current_height),
                                        attenuation_model: Script.getAttenuationModel(output.script),
                                        hash: output.hash,
                                        delta: current_height - output.height,
                                        index: output.index
                                    };
                                    lockedAssetChange.push(lockChange);
                                }
                                list.push(output);
                            }
                            break;
                    }
                }
            });
            if (!targetComplete(change)) throw Error('ERR_INSUFFICIENT_UTXO');
            if (list.length > Constants.UTXO.MAX_COUNT) {
                if (!useLargestEtpUtxo) {
                    return this.findUtxo(utxo, originalTarget, current_height, fee, true)
                        .then(result => resolve(result))
                        .catch(error => reject(Error(error.message)))
                } else {
                    reject(Error('ERR_TOO_MANY_INPUTS'));
                }
            }
            resolve({
                utxo: list,
                change: change,
                lockedAssetChange: lockedAssetChange,
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
    static filter(outputs, filter) {
        return outputs.filter(output => {
            if (filter.type !== undefined) {
                if (!Array.isArray(filter.type) && filter.type !== output.attachment.type)
                    return false;
                else if (Array.isArray(filter.type) && filter.type.indexOf(output.attachment.type) == -1)
                    return false;
            }
            if (filter.symbol !== undefined) {
                if (!Array.isArray(filter.symbol) && filter.symbol !== output.attachment.symbol)
                    return false;
                else if (Array.isArray(filter.symbol) && filter.type.indexOf(output.attachment.symbol) == -1)
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

    static assetSpendable(output, tx_height, current_height) {
        switch (output.attachment.type) {
            case 'asset-transfer':
            case 'asset-issue':
                break;
            default:
                throw Error('ERR_TYPE_NOT_APPLICABLE');
        }
        if (Script.hasAttenuationModel(output.script)) {
            let model = Script.deserializeAttenuationModel(Script.getAttenuationModel(output.script));
            let locked = 0;
            let step_target = model.LH;
            switch (model.TYPE) {
                case 1:
                    for (let period = model.PN; period < model.UN; period++) {
                        if (period != model.PN)
                            step_target += model.LP / model.UN;
                        if (tx_height + step_target > current_height)
                            locked += model.LQ / model.UN;
                    }
                    return output.attachment.quantity - locked;
                case 2:
                case 3:
                    for (let period = model.PN; period < model.UC.length; period++) {
                        if (period != model.PN)
                            step_target += model.UC[period];
                        if (tx_height + step_target > current_height)
                            locked += model.UQ[period];
                    }
                    return output.attachment.quantity - locked;
            }
        } else {
            return output.attachment.quantity;
        }
    };

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
