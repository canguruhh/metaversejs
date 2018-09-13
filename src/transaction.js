'use strict';

var bufferutils = require('./bufferutils.js'),
    crypto = require('crypto'),
    base58check = require('base58check'),
    Script = require('./script'),
    Multisig = require('./multisig'),
    Output = require('./output'),
    Constants = require('./constants'),
    networks = require('./networks'),
    OPS = require('bitcoin-ops');

function Transaction() {
    this.version = 4;
    this.inputs = [];
    this.outputs = [];
    this.lock_time = 0;
}

Transaction.prototype.clone = function() {
    let tx = new Transaction();
    tx.version = this.version;
    this.inputs.forEach((input) => {
        tx.addInput(input.previous_output.address, input.previous_output.hash, input.previous_output.index, input.previous_output.script);
    });
    tx.outputs = JSON.parse(JSON.stringify(this.outputs));
    return tx;
};

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}

function hash256(buffer) {
    return sha256(sha256(buffer));
}

Transaction.calculateTxid = function(rawtx, reverse = true) {
    return (reverse) ? hash256(Buffer.from(rawtx, 'hex')).reverse() : hash256(Buffer.from(rawtx, 'hex'));
};

/**
 * Add an input to the transaction.
 * @param {String} previous_output_address
 * @param {String} previous_output_hash
 * @param {Number} previous_output_index
 */
Transaction.prototype.addInput = function(previous_output_address, previous_output_hash, previous_output_index, previous_output_script) {
    this.inputs.push({
        "address": previous_output_address,
        "previous_output": {
            "address": previous_output_address,
            "hash": previous_output_hash,
            "script": previous_output_script,
            "index": previous_output_index
        },
        "script": "",
        "sequence": 4294967295
    });
};

/**
 * Add a message to the transaction.
 * @param {String} address
 * @param {String} asset
 * @param {Number} value
 */
Transaction.prototype.addMessage = function(address, message) {
    var output = new Output().setMessage(address, message);
    this.outputs.push(output);
    return output;
};

/**
 * Add an output to the transaction.
 * @param {String} address
 * @param {String} asset
 * @param {Number} value
 */
Transaction.prototype.addOutput = function(address, symbol, value, to_did) {
    let output = (symbol === 'ETP') ?
        this.addETPOutput(address, value, to_did) :
        this.addMSTOutput(address, symbol, value, to_did);
    if(Multisig.isMultisigAddress(address)){
        if(to_did) throw Error('Digital identity incompatible with P2SH');
        output.setP2SH();
    }
    return output;
};

/**
 * Add an etp output to the transaction.
 * @param {String} address
 * @param {Number} value
 * @param {String} to_did
 */
Transaction.prototype.addETPOutput = function(address, value, to_did) {
    var output = new Output();
    output.setTransfer(address, value);
    if (to_did)
        output.specifyDid(to_did, "");
    this.outputs.push(output);
    return output;
};

/**
 * Add an MST output to the transaction.
 * @param {String} address
 * @param {String} symbol
 * @param {Number} value
 * @param {String} to_did
 */
Transaction.prototype.addMSTOutput = function(address, symbol, value, to_did) {
    var output = new Output();
    output.setAssetTransfer(address, symbol, value);
    if (to_did)
        output.specifyDid(to_did, "");
    this.outputs.push(output);
    return output;
};

Transaction.prototype.addLockedAssetOutput = function(address, asset, value, attenuation_model, height_delta, from_tx, from_index) {
    var output = new Output();
    this.outputs.push(output.setAssetTransfer(address, asset, value).setAttenuation(attenuation_model, height_delta, from_tx, from_index));
    return output;
};

/**
 * Add an asset issue output to the transaction.
 * @param {String} symbol Up to 63 alphanumeric or . characters
 * @param {Number} max_supply
 * @param {Number} precision Number of decimals from range 0..19
 * @param {String} issuer Name of issuer length < 64 characters
 * @param {String} address Recepient address
 * @param {String} description Description for asset < 64 characters
 * @param {Number} secondaryissue_threshold -1: no limitation; 0: no secondaryissue; 1..100 threshold user has to hold to be able to do secondary issue
 * @param {Boolean} is_secondaryissue indication if this output is a secondary issue of an existing asset
 */
Transaction.prototype.addAssetIssueOutput = function(symbol, max_supply, precision, issuer, address, description, secondaryissue_threshold, is_secondaryissue) {
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
    else if (!Transaction.isAddress(address))
        throw Error('ERR_ADDRESS_FORMAT');
    else if (!(secondaryissue_threshold >= -1 || secondaryissue_threshold <= 100))
        throw Error('ERR_SECONDARYISSUE_THRESHOLD_OUT_OF_RANGE');
    else {
        let output = new Output().setAssetIssue(symbol, max_supply, precision, issuer, address, description, secondaryissue_threshold, is_secondaryissue);
        this.outputs.push(output);
        return output;
    }
};

/**
 * Add certificate output to the transaction.
 *
 * @param {String} symbol
 * @param {String} owner
 * @param {String} address
 * @param {String} cert domain / issue / naming
 * @param {Number} status
 */
Transaction.prototype.addCertOutput = function(symbol, owner, address, cert, status) {
    let output = new Output();
    this.outputs.push(output.setCert(symbol, owner, address, cert, status));
    return output;
};

/**
 * Add did issue output to the transaction.
 *
 * @param {String} address
 * @param {String} symbol
 */
Transaction.prototype.addDidIssueOutput = function(address, symbol, did_address) {
    var output = new Output();
    this.outputs.push(output.setIdentityIssue(address, symbol, did_address));
    return output;
};

/**
 * Add MIT transfer output to the transaction.
 * @param {String} address
 * @param {String} symbol
 */
Transaction.prototype.addMITTransferOutput = function(address, symbol) {
    var output = new Output();
    this.outputs.push(output.setMITTransfer(address, symbol));
    return output;
};

/**
 * Add MIT issue output to the transaction.
 *
 * @param {String} address
 * @param {String} symbol
 * @param {String} content
 */
Transaction.prototype.addMITRegisterOutput = function(address, symbol, content) {
    var output = new Output();
    this.outputs.push(output.setMITRegister(address, symbol, content));
    return output;
};

/**
 * Add did transfer output to the transaction.
 * @param {String} address
 * @param {String} symbol
 */
Transaction.prototype.addDidTransferOutput = function(address, symbol) {
    var output = new Output();
    this.outputs.push(output.setIdentityTransfer(address, symbol));
    return output;
};

/**
 * Add locked etp output to the transaction.
 * @param {String} address
 * @param {Number} value
 * @param {Number} locktime Number of blocks
 */
Transaction.prototype.addLockOutput = function(address, value, locktime, network) {

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
};

/**
 * Clear the transactions input scripts.
 * @returns {Transaction}
 */
Transaction.prototype.clearInputScripts = function() {
    this.inputs.forEach((input) => {
        input.script = [];
    });
    return this;
};

/**
 * Encode the version number for the raw transaction.
 * @param {Number} version
 * @returns {Buffer}
 */
function encodeVersion(version) {
    var buffer = Buffer.allocUnsafe(4);
    buffer.writeInt32LE(version, 0);
    return buffer;
}

/**
 * Encodes the transaction to a raw transaction.
 * @param {Number} add_address_to_previous_output_index (optional) Index of an input thats previous output address should be added (needed for signing).
 * @returns {Buffer} Serialized hex encoded raw transaction.
 */
Transaction.prototype.encode = function(add_address_to_previous_output_index) {
    return Buffer.concat([
        encodeVersion(this.version),
        encodeInputs(this.inputs, add_address_to_previous_output_index),
        encodeOutputs(this.outputs),
        encodeLockTime(this.lock_time)
    ]);
};

/**
 * Decode hex encoded string to transaction
 * @param {} string hex encoded string
 * @returns Transaction
 */
Transaction.decode = function(string) {
    return Transaction.fromBuffer(Buffer.from(string, 'hex'));
};

/**
 * Encode raw transaction ouputs.
 * @param {Array<Output>} outputs
 * @returns {Buffer} Encoded outputs
 * @throws {Error}
 */
function encodeOutputs(outputs) {

    //Initialize buffer and offset
    let offset = 0;
    var buffer = Buffer.allocUnsafe(100000);
    //Write number of inputs
    offset += bufferutils.writeVarInt(buffer, outputs.length, offset);

    outputs.forEach((output) => {
        //Write value as 8byte integer
        offset = bufferutils.writeUInt64LE(buffer, output.value, offset);
        //Output script
        switch (output.script_type) {
            case 'p2sh':
                offset = writeScriptPayToScriptHash(output.address, buffer, offset);
                break;
            case 'pubkeyhash':
                offset = writeScriptPayToPubKeyHash(output.address, buffer, offset);
                break;
            case 'lock':
                let locktime_le_string = parseInt(output.locktime).toString(16).replace(/^(.(..)*)$/, "0$1").match(/../g).reverse().join("");
                offset = writeScriptLockedPayToPubKeyHash(output.address, locktime_le_string, buffer, offset);
                break;
            case 'attenuation':
                let model = Script.deserializeAttenuationModel(output.attenuation.model);
                if (output.attenuation.height_delta > 0)
                    model = Script.adjustAttenuationModel(model, output.attenuation.height_delta);
                offset = writeAttenuationScript(Script.serializeAttenuationModel(model), output.attenuation.from_tx, output.attenuation.from_index, output.address, buffer, offset);
                break;
            default:
                throw 'Unknown script type: ' + output.script_type;
        }

        // attachment
        offset = buffer.writeUInt32LE(output.attachment.version, offset);
        offset = buffer.writeUInt32LE(output.attachment.type, offset);

        if (output.attachment.version === Constants.ATTACHMENT.VERSION.DID) {
            offset += encodeString(buffer, output.attachment.to_did, offset);
            offset += encodeString(buffer, output.attachment.from_did, offset);
        }

        switch (output.attachment.type) {
            case Constants.ATTACHMENT.TYPE.ETP_TRANSFER:
                break;
            case Constants.ATTACHMENT.TYPE.MST:
                switch (output.attachment.status) {
                    case Constants.MST.STATUS.REGISTER:
                        offset = Transaction.encodeAttachmentAssetIssue(buffer, offset, output.attachment);
                        break;
                    case Constants.MST.STATUS.TRANSFER:
                        offset = Transaction.encodeAttachmentMSTTransfer(buffer, offset, output.attachment.symbol, output.attachment.quantity);
                        break;
                    default:
                        throw Error("Asset status unknown");
                }
                break;
            case Constants.ATTACHMENT.TYPE.MESSAGE:
                offset = Transaction.encodeAttachmentMessage(buffer, offset, output.attachment.message);
                break;
            case Constants.ATTACHMENT.TYPE.AVATAR:
                offset = Transaction.encodeAttachmentDid(buffer, offset, output.attachment);
                break;
            case Constants.ATTACHMENT.TYPE.CERT:
                offset = Transaction.encodeAttachmentCert(buffer, offset, output.attachment);
                break;
            case Constants.ATTACHMENT.TYPE.MIT:
                switch (output.attachment.status) {
                    case Constants.MIT.STATUS.REGISTER:
                        offset = Transaction.encodeAttachmentMITRegister(buffer, offset, output.attachment.symbol, output.attachment.content, output.attachment.address);
                        break;
                    case Constants.MIT.STATUS.TRANSFER:
                        offset = Transaction.encodeAttachmentMITTransfer(buffer, offset, output.attachment.symbol, output.attachment.address);
                        break;
                    default:
                        throw Error("Asset status unknown");
                }
                break;
            default:
                throw Error("What kind of an output is that?!");
        }
    });

    return buffer.slice(0, offset);
}

/**
 * Encode raw transactions inputs
 * @param {Array<input>} inputs
 * @param {Number} add_address_to_previous_output_index (optional) Index of an input thats previous output address should be added (needed for signing).
 * @returns {Buffer}
 * @throws {Error}
 */
function encodeInputs(inputs, add_address_to_previous_output_index) {
    //Initialize buffer and offset
    let offset = 0;
    var buffer = Buffer.allocUnsafe(100000);
    //Write number of inputs
    offset += bufferutils.writeVarInt(buffer, inputs.length, offset);

    inputs.forEach((input, index) => {
        //Write reversed hash
        offset += new Buffer(input.previous_output.hash, 'hex').reverse().copy(buffer, offset);
        //Index
        offset = buffer.writeUInt32LE(input.previous_output.index, offset);
        if (add_address_to_previous_output_index !== undefined) {
            if (index == add_address_to_previous_output_index) {
                let lockregex = /^\[\ ([a-f0-9]+)\ \]\ numequalverify dup\ hash160\ \[ [a-f0-9]+\ \]\ equalverify\ checksig$/gi;
                if (input.previous_output.script && input.previous_output.script.match(lockregex)) {
                    let locktime = lockregex.exec(input.previous_output.script.match(lockregex)[0])[1];
                    offset = writeScriptLockedPayToPubKeyHash(input.previous_output.address, locktime, buffer, offset);
                } else {
                    if (Script.hasAttenuationModel(input.previous_output.script)) {
                        let params = Script.getAttenuationParams(input.previous_output.script);
                        offset = writeAttenuationScript(params.model, (params.hash !== '0000000000000000000000000000000000000000000000000000000000000000') ? params.hash : undefined, (params.index >= 0) ? params.index : undefined, input.previous_output.address, buffer, offset);
                    } else
                        offset = writeScriptPayToPubKeyHash(input.previous_output.address, buffer, offset);
                }
            } else {
                offset = buffer.writeUInt8(0, offset);
            }
        } else {
            //input script
            let script_buffer = Transaction.encodeInputScript(input.script);
            offset = buffer.writeInt8(script_buffer.length, offset);
            offset += script_buffer.copy(buffer, offset);
        }

        buffer.writeUInt32BE(input.sequence, offset);
        offset += 4;
    });
    return buffer.slice(0, offset);
}

/**
 * Encode the lock time.
 * @param {Number} lock_time
 * @returns {Buffer}
 */
function encodeLockTime(lock_time) {
    var buffer = Buffer.allocUnsafe(4);
    buffer.writeInt32LE(lock_time, 0);
    return buffer;
}

/**
 * Helper function to encode the attachment for a message.
 * @param {Buffer} buffer
 * @param {Number} offset
 * @param {string} message
 * @returns {Number} New offset
 * @throws {Error}
 */
Transaction.encodeAttachmentMessage = function(buffer, offset, message) {
    if (message == undefined)
        throw Error('Specify message');
    offset += encodeString(buffer, message, offset);
    return offset;
};

/**
 * Helper function to encode the attachment for an asset transfer.
 * @param {Buffer} buffer
 * @param {Number} offset
 * @param {String} symbol
 * @param {Number} quantity
 * @returns {Number} New offset
 * @throws {Error}
 */
Transaction.encodeAttachmentMSTTransfer = function(buffer, offset, symbol, quantity) {
    if (symbol == undefined)
        throw Error('Specify output asset');
    if (quantity == undefined)
        throw Error('Specify output quanity');
    offset = buffer.writeUInt32LE(Constants.MST.STATUS.TRANSFER, offset);
    offset += encodeString(buffer, symbol, offset);
    offset = bufferutils.writeUInt64LE(buffer, quantity, offset);
    return offset;
};

/**
 * Helper function to encode the attachment for a new did.
 * @param {Buffer} buffer
 * @param {Number} offset
 * @param {Number} attachment_data
 * @returns {Number} New offset
 * @throws {Error}
 */
Transaction.encodeAttachmentDid = function(buffer, offset, attachment_data) {
    offset = buffer.writeUInt32LE(attachment_data.status, offset);
    offset += encodeString(buffer, attachment_data.symbol, offset);
    offset += encodeString(buffer, attachment_data.address, offset);
    return offset;
};

/**
 * Helper function to encode the attachment for a certificate.
 * @param {Buffer} buffer
 * @param {Number} offset
 * @param {Number} attachment_data
 * @returns {Number} New offset
 * @throws {Error}
 */
Transaction.encodeAttachmentCert = function(buffer, offset, attachment_data) {
    offset += encodeString(buffer, attachment_data.symbol, offset);
    offset += encodeString(buffer, attachment_data.owner, offset);
    offset += encodeString(buffer, attachment_data.address, offset);
    offset = buffer.writeUInt32LE(attachment_data.cert, offset);
    offset = buffer.writeUInt8(attachment_data.status, offset);
    return offset;
};

/**
 * Helper function to encode the attachment for a new asset.
 * @param {Buffer} buffer
 * @param {Number} offset
 * @param {Number} attachment_data
 * @returns {Number} New offset
 * @throws {Error}
 */
Transaction.encodeAttachmentAssetIssue = function(buffer, offset, attachment_data) {
    offset = buffer.writeUInt32LE(attachment_data.status, offset);
    //Encode symbol
    offset += encodeString(buffer, attachment_data.symbol, offset);
    //Encode maximum supply
    offset = bufferutils.writeUInt64LE(buffer, attachment_data.max_supply, offset);
    //Encode precision
    offset = buffer.writeUInt8(attachment_data.precision, offset);
    //Encode secondary issue threshold
    offset = buffer.writeUInt8((attachment_data.secondaryissue_threshold) ? attachment_data.secondaryissue_threshold : 0, offset);
    offset += buffer.write("0000", offset, 2, 'hex');
    //Encode issuer
    offset += encodeString(buffer, attachment_data.issuer, offset);
    //Encode recipient address
    offset += encodeString(buffer, attachment_data.address, offset);
    //Encode description
    offset += encodeString(buffer, attachment_data.description, offset);
    return offset;
};

/**
 * Helper function to encode the attachment for a new MIT.
 * @param {Buffer} buffer
 * @param {Number} offset
 * @param {String} symbol
 * @param {String} content
 * @param {String} address
 * @returns {Number} New offset
 * @throws {Error}
 */
Transaction.encodeAttachmentMITRegister = function(buffer, offset, symbol, content, address) {
    offset = buffer.writeUInt8(Constants.MIT.STATUS.REGISTER, offset);
    offset += encodeString(buffer, symbol, offset);
    offset += encodeString(buffer, address, offset);
    offset += encodeString(buffer, content, offset);
    return offset;
};

/**
 * Helper function to encode the attachment for a new MIT.
 * @param {Buffer} buffer
 * @param {Number} offset
 * @param {String} symbol
 * @param {String} address
 * @returns {Number} New offset
 * @throws {Error}
 */
Transaction.encodeAttachmentMITTransfer = function(buffer, offset, symbol, address) {
    offset = buffer.writeUInt8(Constants.MIT.STATUS.TRANSFER, offset);
    offset += encodeString(buffer, symbol, offset);
    offset += encodeString(buffer, address, offset);
    return offset;
};



/**
 * Enodes the given input script.
 * @param {String} script_string
 * @returns {Buffer}
 */
Transaction.encodeInputScript = (parameters) => Script.fromChunks((parameters) ? parameters : []).buffer;

/**
 * Write p2sh to the given buffer.
 * @param {String} scripthash For example multisig address
 * @param {Buffer} buffer
 * @param {Number} offset
 * @returns {Number} new offset
 */
function writeScriptPayToScriptHash(scripthash, buffer, offset) {
    offset = buffer.writeUInt8(23, offset); //Script length
    offset = buffer.writeUInt8(OPS.OP_HASH160, offset);
    //Write previous output address
    offset = buffer.writeUInt8(20, offset); //Address length
    offset += new Buffer(base58check.decode(scripthash, 'hex').data, 'hex').copy(buffer, offset);
    //Static transfer stuff
    offset = buffer.writeUInt8(OPS.OP_EQUAL, offset);
    return offset;
}

/**
 * Write p2pkh to the given buffer.
 * @param {String} address
 * @param {Buffer} buffer
 * @param {Number} offset
 * @returns {Number} new offset
 */
function writeScriptPayToPubKeyHash(address, buffer, offset) {
    offset = buffer.writeUInt8(25, offset); //Script length
    offset = buffer.writeUInt8(OPS.OP_DUP, offset);
    offset = buffer.writeUInt8(OPS.OP_HASH160, offset);
    //Write previous output address
    offset = buffer.writeUInt8(20, offset); //Address length
    offset += new Buffer(base58check.decode(address, 'hex').data, 'hex').copy(buffer, offset);
    //Static transfer stuff
    offset = buffer.writeUInt8(OPS.OP_EQUALVERIFY, offset);
    offset = buffer.writeUInt8(OPS.OP_CHECKSIG, offset);
    return offset;
}

/**
 * Write p2pkh attenuation script to the given buffer.
 * @param {String} attenuation_string
 * @param {String} from_tx
 * @param {number} index
 * @param {String} address
 * @param {Buffer} buffer
 * @param {Number} offset
 * @returns {Number} new offset
 */
function writeAttenuationScript(attenuation_string, from_tx, from_index, address, buffer, offset) {
    let attenuation_buffer = Buffer.from(attenuation_string.toString('hex'));
    offset += bufferutils.writeVarInt(buffer, 26 + attenuation_string.length + 40, offset);
    offset = buffer.writeUInt8(77, offset);
    offset = buffer.writeInt16LE(attenuation_string.length, offset);
    offset += attenuation_buffer.copy(buffer, offset);
    offset = buffer.writeUInt8(36, offset);
    let hash = Buffer.from((from_tx != undefined) ? from_tx : '0000000000000000000000000000000000000000000000000000000000000000', 'hex').reverse();
    let index = Buffer.from('ffffffff', 'hex');
    if (from_index != undefined)
        index.writeInt32LE(from_index, 0);
    offset += Buffer.concat([hash, index]).copy(buffer, offset);
    offset = buffer.writeUInt8(178, offset);
    offset = buffer.writeUInt8(OPS.OP_DUP, offset);
    offset = buffer.writeUInt8(OPS.OP_HASH160, offset);
    //Write previous output address
    offset = buffer.writeUInt8(20, offset); //Address length
    offset += new Buffer(base58check.decode(address, 'hex').data, 'hex').copy(buffer, offset);
    //Static transfer stuff
    offset = buffer.writeUInt8(OPS.OP_EQUALVERIFY, offset);
    offset = buffer.writeUInt8(OPS.OP_CHECKSIG, offset);
    return offset;
}

/**
 * Write locked p2pkh to the given buffer.
 * @param {String} address
 * @param {String} locktime little endian hex
 * @param {Buffer} buffer
 * @param {Number} offset
 * @returns {Number} new offset
 */
function writeScriptLockedPayToPubKeyHash(address, locktime, buffer, offset) {
    let locktime_buffer = new Buffer(locktime, 'hex');
    offset = buffer.writeUInt8(27 + locktime_buffer.length, offset); //Script length
    offset = buffer.writeUInt8(locktime_buffer.length, offset); //Length of locktime
    offset += locktime_buffer.copy(buffer, offset);
    offset = buffer.writeUInt8(OPS.OP_NUMEQUALVERIFY, offset);
    offset = buffer.writeUInt8(OPS.OP_DUP, offset);
    offset = buffer.writeUInt8(OPS.OP_HASH160, offset);
    //Write previous output address
    offset = buffer.writeUInt8(20, offset); //Address length
    offset += new Buffer(base58check.decode(address, 'hex').data, 'hex').copy(buffer, offset);
    offset = buffer.writeUInt8(OPS.OP_EQUALVERIFY, offset);
    offset = buffer.writeUInt8(OPS.OP_CHECKSIG, offset);
    return offset;
}

function encodeString(buffer, str, offset, encoding = 'utf-8') {
    var payload = new Buffer.from(str, encoding);
    offset += bufferutils.writeVarInt(buffer, payload.length, offset);
    return payload.copy(buffer, offset) + 1;
}


Transaction.isAddress = (address) => (address.length == 34) && (address.charAt(0) == 'M' || address.charAt(0) == 't' || address.charAt(0) == '3');

Transaction.fromBuffer = function(buffer) {
    var offset = 0;

    function readSlice(n) {
        offset += n;
        return buffer.slice(offset - n, offset);
    }

    function readUInt8() {
        offset += 1;
        return buffer.readUInt8(offset - 1);
    }

    function readUInt32() {
        offset += 4;
        return buffer.readUInt32LE(offset - 4);
    }

    function readUInt64() {
        offset += 8;
        return bufferutils.readUInt64LE(buffer, offset - 8);
    }

    function readVarInt() {
        var vi = bufferutils.readVarInt(buffer, offset);
        offset += vi.size;
        return vi.number;
    }

    function readString() {
        var length = bufferutils.readVarInt(buffer, offset);
        offset += length.size;
        return readSlice(length.number).toString();
    }

    function readScript() {
        return Script.fromBuffer(readSlice(readVarInt())).toASM();
    }

    function readAttachment() {
        let attachment = {};
        attachment.version = readUInt32();
        attachment.type = readUInt32();

        if (attachment.version === Constants.ATTACHMENT.VERSION.DID) {
            attachment.to_did = readString();
            attachment.from_did = readString();
        }

        switch (attachment.type) {
            case Constants.ATTACHMENT.TYPE.ETP_TRANSFER:
                break;
            case Constants.ATTACHMENT.TYPE.MST:
                attachment.status = readUInt32();
                switch (attachment.status) {
                    case Constants.MST.STATUS.REGISTER:
                        attachment.symbol = readString();
                        attachment.max_supply = readUInt64();
                        attachment.precision = readUInt8();
                        attachment.secondaryissue_threshold = readUInt8();
                        if (attachment.secondaryissue_threshold == 127)
                            attachment.secondaryissue_threshold = -1;
                        if (attachment.secondaryissue_threshold > 127) {
                            attachment.secondaryissue_threshold -= 128;
                            attachment.is_secondaryissue = 1;
                        } else {
                            attachment.is_secondaryissue = 0;
                        }
                        offset += 2;
                        attachment.issuer = readString();
                        attachment.address = readString();
                        attachment.description = readString();
                        break;
                    case Constants.MST.STATUS.TRANSFER:
                        attachment.asset = readString();
                        attachment.quantity = readUInt64();
                        break;
                    default:
                        throw 'Unknown attachment status: ' + attachment.status;
                }
                break;
            case Constants.ATTACHMENT.TYPE.MESSAGE:
                attachment.message = readString();
                break;
            case Constants.ATTACHMENT.TYPE.AVATAR:
                attachment.status = readUInt32();
                attachment.symbol = readString();
                attachment.address = readString();
                break;
            case Constants.ATTACHMENT.TYPE.MIT:
                attachment.status = readUInt8();
                attachment.symbol = readString();
                if (attachment.status == Constants.MIT.STATUS.REGISTER) {
                    attachment.content = readString();
                }
                attachment.address = readString();
                break;
            case Constants.ATTACHMENT.TYPE.CERT:
                attachment.symbol = readString();
                attachment.owner = readString();
                attachment.address = readString();
                attachment.cert = readUInt32();
                attachment.status = readUInt8();
                break;
            default:
                throw 'Unknown attachment type: ' + attachment.type;
        }
        return attachment;
    }

    function readGenerationScript() {
        return new Script(readSlice(readVarInt()), []);
    }

    var tx = new Transaction();
    tx.version = readUInt32();

    var input_length = readVarInt();
    for (var i = 0; i < input_length; ++i) {
        tx.inputs.push({
            previous_output: {
                hash: readSlice(32).reverse().toString('hex'),
                index: readUInt32()
            },
            script: readScript(),
            sequence: readUInt32()
        });
    }

    var output_length = readVarInt();
    for (i = 0; i < output_length; ++i) {
        tx.outputs.push({
            value: readUInt64(),
            script: readScript(),
            attachment: readAttachment()
        });
    }

    tx.lock_time = readUInt32();

    return tx;
};

module.exports = Transaction;
