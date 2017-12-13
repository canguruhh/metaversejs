'use strict';

var bufferutils = require('./bufferutils.js'),
    base58check = require('base58check'),
    Script = require('./script'),
    OPS = require('bitcoin-ops');

function Transaction() {
    this.version = 2;
    this.inputs = [];
    this.outputs = [];
    this.lock_time = 0;
}


Transaction.ATTACHMENT_TYPE_ETP_TRANSFER = 0;
Transaction.ATTACHMENT_TYPE_ASSET = 2;
Transaction.ATTACHMENT_TYPE_MESSAGE = 3;

Transaction.ASSET_STATUS_ISSUE = 1;
Transaction.ASSET_STATUS_TRANSFER = 2;

Transaction.DEFAULT_FEE = 10000;
Transaction.ASSET_ISSUE_DEFAULT_FEE = 100000;

Transaction.prototype.clone = function() {
    let tx = new Transaction();
    tx.version = this.version;
    this.inputs.forEach((input) => {
        tx.addInput(input.previous_output.address, input.previous_output.hash, input.previous_output.index, input.previous_output.script);
    });
    tx.outputs = JSON.parse(JSON.stringify(this.outputs));
    return tx;
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
    this.outputs.push({
        "address": address,
        "attachment": {
            type: Transaction.ATTACHMENT_TYPE_MESSAGE,
            version: 1,
            message: message
        },
        "script_type": "pubkeyhash",
        "value": 0
    });
};

/**
 * Add an output to the transaction.
 * @param {String} address
 * @param {String} asset
 * @param {Number} value
 */
Transaction.prototype.addOutput = function(address, asset, value) {
    if (asset == "ETP") {
        this.outputs.push({
            "address": address,
            "attachment": {
                type: Transaction.ATTACHMENT_TYPE_ETP_TRANSFER,
                version: 1
            },
            "script_type": "pubkeyhash",
            "value": value
        });
    } else {
        this.outputs.push({
            "address": address,
            "attachment": {
                "type": Transaction.ATTACHMENT_TYPE_ASSET,
                "version": 1,
                "asset": asset,
                "quantity": value,
                "status": Transaction.ASSET_STATUS_TRANSFER
            },
            "script_type": "pubkeyhash",
            "value": 0
        });
    }
};

/**
 * Add an asset issue output to the transaction.
 * @param {String} symbol Up to 63 alphanumeric or . characters
 * @param {Number} max_supply
 * @param {Number} precision Number of decimals from range 0..19
 * @param {String} issuer Name of issuer length < 64 characters
 * @param {String} address Recepient address
 * @param {String} description Description for asset < 64 characters
 */
Transaction.prototype.addAssetIssueOutput = function(symbol, max_supply, precision, issuer, address, description) {
    if (!/^([A-Z0-9\.]{3,63})$/.test(symbol))
        throw Error('ERR_SYMBOL_NAME');
    else if (!/^([A-Za-z0-9\.]{3,63})$/.test(issuer))
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
    else
        this.outputs.push({
            "address": address,
            "attachment": {
                "type": Transaction.ATTACHMENT_TYPE_ASSET,
                "version": 1,
                "status": Transaction.ASSET_STATUS_ISSUE,
                "symbol": symbol,
                "max_supply": max_supply,
                "precision": precision,
                "issuer": issuer,
                "address": address,
                "description": description
            },
            "script_type": "pubkeyhash",
            "value": 0
        });
};

/**
 * Add locked etp output to the transaction.
 * @param {String} address
 * @param {Number} value
 * @param {Number} locktime Number of blocks
 */
Transaction.prototype.addLockOutput = function(address, value, locktime) {
    switch (locktime) {
        case 25200:
        case 108000:
        case 331200:
        case 655200:
        case 1314000:
            this.outputs.push({
                "address": address,
                "attachment": {
                    type: Transaction.ATTACHMENT_TYPE_ETP_TRANSFER,
                    version: 1
                },
                "value": value,
                "script_type": "lock",
                "locktime": locktime
            });
            break;
        default:
            throw "Illegal locktime";
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
        if (output.script_type === "pubkeyhash") {
            offset = writeScriptPayToPubKeyHash(output.address, buffer, offset);
        } else if (output.script_type === "lock") {
            let locktime_le_string = parseInt(output.locktime).toString(16).replace(/^(.(..)*)$/, "0$1").match(/../g).reverse().join("");
            offset = writeScriptLockedPayToPubKeyHash(output.address, locktime_le_string, buffer, offset);
        } else {
            throw 'Unknown script type: ' + output.script_type;
        }

        // attachment
        offset = buffer.writeUInt32LE(output.attachment.version, offset);
        offset = buffer.writeUInt32LE(output.attachment.type, offset);

        switch (output.attachment.type) {
            case Transaction.ATTACHMENT_TYPE_ETP_TRANSFER:
                break;
            case Transaction.ATTACHMENT_TYPE_ASSET:
                switch (output.attachment.status) {
                    case Transaction.ASSET_STATUS_ISSUE:
                        offset = Transaction.encodeAttachmentAssetIssue(buffer, offset, output.attachment);
                        break;
                    case Transaction.ASSET_STATUS_TRANSFER:
                        offset = Transaction.encodeAttachmentAssetTransfer(buffer, offset, output.attachment);
                        break;
                    default:
                        throw Error("Asset status unknown");
                }
                break;
            case Transaction.ATTACHMENT_TYPE_MESSAGE:
                offset = Transaction.encodeAttachmentMessage(buffer, offset, output.attachment.message);
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
                //Check if previous output was locked before
                if (input.previous_output.script && input.previous_output.script.match(lockregex)) {
                    let locktime = lockregex.exec(input.previous_output.script.match(lockregex)[0])[1];
                    offset = writeScriptLockedPayToPubKeyHash(input.previous_output.address, locktime, buffer, offset);
                } else {
                    //Previous output was p2pkh
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
 * @param {Number} attachment_data_type
 * @returns {Number} New offset
 * @throws {Error}
 */
Transaction.encodeAttachmentAssetTransfer = function(buffer, offset, attachment_data) {
    if (attachment_data.asset == undefined)
        throw Error('Specify output asset');
    if (attachment_data.quantity == undefined)
        throw Error('Specify output quanity');
    offset = buffer.writeUInt32LE(attachment_data.status, offset);
    offset = buffer.writeUInt8(attachment_data.asset.length, offset);
    offset += new Buffer(attachment_data.asset).copy(buffer, offset);
    offset = bufferutils.writeUInt64LE(buffer, attachment_data.quantity, offset);
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
    offset += buffer.write("000000", offset, 3, 'hex');

    //Encode issuer
    offset += encodeString(buffer, attachment_data.issuer, offset);
    //Encode recipient address
    offset += encodeString(buffer, attachment_data.address, offset);
    //Encode description
    offset += encodeString(buffer, attachment_data.description, offset);
    return offset;
};


/**
 * Enodes the given input script.
 * @param {String} script_string
 * @returns {Buffer}
 */
Transaction.encodeInputScript = (parameters) => Script.fromChunks((parameters)?parameters:[]).buffer;

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

function encodeString(buffer, str, offset) {
    var payload = new Buffer.from(str, 'utf-8');
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
        if (attachment.type == 2) {
            attachment.status = readUInt32();
            if (attachment.status == 2) {
                attachment.asset = readString();
                attachment.quantity = readUInt64();
            } else {
                throw 'Unknown attachment status: ' + attachment.status;
            }
        } else if (attachment.type == 0) {

        } else {
            throw 'Unknown attachment type: ' + attachment.type;
        }
        return attachment;
    }

    function readGenerationScript() {
        return new Script(readSlice(readVarInt()), []);
    }

    var tx = new Transaction();
    tx.version = readUInt32();

    for (var i = 0; i < readVarInt(); ++i) {
        tx.inputs.push({
            previous_output:{
                hash: readSlice(32),
                index: readUInt32()
            },
            script: readScript(),
            sequence: readUInt32()
        });
    }

    for (i = 0; i < readVarInt(); ++i) {
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
