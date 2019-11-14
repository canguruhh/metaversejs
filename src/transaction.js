'use strict';

const crypto = require('crypto'),
    Script = require('./script'),
    Multisig = require('./multisig'),
    Encoder = require('./encoder'),
    Output = require('./output'),
    Constants = require('./constants'),
    networks = require('./networks');

class Transaction {

    constructor() {
        this.version = 4;
        this.inputs = [];
        this.outputs = [];
        this.lock_time = 0;
    }

    clone() {
        let tx = new Transaction();
        tx.version = this.version;
        this.inputs.forEach((input) => {
            tx.addInput(input.previous_output.address, input.previous_output.hash, input.previous_output.index, input.previous_output.script);
        });
        tx.outputs = JSON.parse(JSON.stringify(this.outputs));
        return tx;
    }
    addInput(previous_output_address, previous_output_hash, previous_output_index, previous_output_script) {
        const input = {
            "address": previous_output_address,
            "previous_output": {
                "address": previous_output_address,
                "hash": previous_output_hash,
                "script": previous_output_script,
                "index": previous_output_index
            },
            "script": "",
            "sequence": 4294967295
        }
        if (Script.isStakeLock(input.previous_output.script)) {
            input.sequence = Script.fromASM(input.previous_output.script).getLockLength()
        }
        this.inputs.push(input);
    };
    addMessage(address, message) {
        var output = new Output().setMessage(address, message);
        this.outputs.push(output);
        return output;
    }
    addOutput(address, symbol, value, to_did) {
        let output = (symbol === 'ETP') ?
            this.addETPOutput(address, value, to_did) :
            this.addMSTOutput(address, symbol, value, to_did);
        if (Multisig.isMultisigAddress(address)) {
            if (to_did) throw Error('Digital identity incompatible with P2SH');
            output.setP2SH();
        }
        return output;
    }
    addETPOutput(address, value, to_did) {
        var output = new Output();
        output.setTransfer(address, value);
        if (to_did)
            output.specifyDid(to_did, "");
        this.outputs.push(output);
        return output;
    }
    addMSTOutput(address, symbol, value, to_did) {
        var output = new Output();
        output.setAssetTransfer(address, symbol, value);
        if (to_did)
            output.specifyDid(to_did, "");
        this.outputs.push(output);
        return output;
    }

    addLockedAssetOutput(recipient_address, recipient_avatar, symbol, quantity, attenuation_model, height_delta, from_tx, from_index) {
        return this.addMSTOutput(recipient_address, symbol, quantity, recipient_avatar)
            .setAttenuation(attenuation_model, height_delta, from_tx, from_index)
    }

    addAssetIssueOutput(symbol, max_supply, precision, issuer, address, description, secondaryissue_threshold, is_secondaryissue, issue_to_did) {
        if (!/^([A-Z0-9\.]{3,63})$/.test(symbol))
            throw Error('ERR_SYMBOL_NAME');
        else if (!/^([A-Za-z0-9\.@_-]{3,63})$/.test(issuer))
            throw Error('ERR_ISSUER_NAME');
        else if (max_supply <= 0)
            throw Error('ERR_MAX_SUPPLY_TOO_LOW');
        else if (precision < 0)
            throw Error('ERR_PRECISION_NEGATIVE');
        else if (precision >= 20)
            throw Error('ERR_PRECISION_TOO_HIGH');
        else if (description.length >= 64)
            throw Error('ERR_DESCRIPTION_TOO_LONG');
        else if (!isAddress(address))
            throw Error('ERR_ADDRESS_FORMAT');
        else if (!(secondaryissue_threshold >= -1 || secondaryissue_threshold <= 100))
            throw Error('ERR_SECONDARYISSUE_THRESHOLD_OUT_OF_RANGE');
        else {
            let output = new Output().setAssetIssue(symbol, max_supply, precision, issuer, address, description, secondaryissue_threshold, is_secondaryissue);
            if(issue_to_did){
                output.specifyDid(issuer, '')
            }
            this.outputs.push(output);
            return output;
        }
    }

    addCertOutput(symbol, owner, address, cert, status, content) {
        let output = new Output();
        output.specifyDid(owner, "")
        this.outputs.push(output.setCert(symbol, owner, address, cert, status, content));
        return output;
    }

    addDidIssueOutput(address, symbol, did_address) {
        var output = new Output();
        this.outputs.push(output.setIdentityIssue(address, symbol, did_address));
        return output;
    }


    addMITRegisterOutput(address, symbol, content) {
        var output = new Output();
        this.outputs.push(output.setMITRegister(address, symbol, content));
        return output;
    }

    addMITTransferOutput(address, symbol) {
        var output = new Output();
        this.outputs.push(output.setMITTransfer(address, symbol));
        return output;
    }

    addDidTransferOutput(address, symbol) {
        var output = new Output();
        this.outputs.push(output.setIdentityTransfer(address, symbol));
        return output;
    }

    /**
     * Add ETP deposit lock output
     * 
     * @deprecated ETP deposit has been deactivated by supernova hardfork
     * 
     * @param {} address 
     * @param {*} value 
     * @param {*} locktime 
     * @param {*} network 
     */
    addLockOutput(address, value, locktime, network) {

        if (network == undefined)
            network = networks['mainnet'];
        else if (typeof network === 'string' && networks[network])
            network = networks[network];

        locktime = parseInt(locktime);

        if (network.locktimes.indexOf(locktime) !== -1) {
            var output = new Output();
            this.outputs.push(output.setDeposit(address, value, locktime));
            return output;
        } else {
            throw Error('Illegal locktime');
        }
    }

    clearInputScripts() {
        this.inputs.forEach((input) => {
            input.script = [];
        });
        return this;
    }

    encode(add_address_to_previous_output_index) {
        return Encoder.encodeTransaction(this, add_address_to_previous_output_index);
    }

    static decode(rawtx, network) {
        return Encoder.decodeTransaction(new Transaction(), rawtx, network);
    }

    static calculateTxid(rawtx, reverse = true) {
        return (reverse) ? hash256(Buffer.from(rawtx, 'hex')).reverse() : hash256(Buffer.from(rawtx, 'hex'));
    }
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}

function hash256(buffer) {
    return sha256(sha256(buffer));
}

function isAddress(address) {
    return (address.length == 34) && (address.charAt(0) == 'M' || address.charAt(0) == 't' || address.charAt(0) == '3');
};

module.exports = Transaction;
