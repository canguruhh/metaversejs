'use strict';

var bufferutils = require('./bufferutils.js');
var base58check = require('base58check');

function Transaction() {
    this.version = 2;
    this.inputs = [];
    this.outputs = [];
    this.lock_time = 0;
}

Transaction.ATTACHMENT_TYPE_ETP_TRANSFER = 0;
Transaction.ATTACHMENT_TYPE_ASSET_TRANSFER = 2;
Transaction.DEFAULT_FEE = 10000;

/**
 * Add an input to the transaction.
 * @param {String} previous_output_address
 * @param {String} previous_output_hash
 * @param {Number} previous_output_index
 */
Transaction.prototype.addInput= function(previous_output_address, previous_output_hash, previous_output_index){
    this.inputs.push({
        "address": previous_output_address,
        "previous_output":{
            "address": previous_output_address,
            "hash": previous_output_hash,
            "index": previous_output_index
        },
        "script": "",
        "sequence": 4294967295
    });
};

/**
 * Add an output to the transaction.
 * @param {String} address
 * @param {String} asset
 * @param {Number} value
 * @param {String} script
 */
Transaction.prototype.addOutput= function(address, asset, value, script){
    let output={
        "address": address,
        "script": script
    };
    if(asset=="ETP"){
        output.attachment={
            type: Transaction.ATTACHMENT_TYPE_ETP_TRANSFER,
            version: 1
        };
        output.value= value;
    } else {
        output.attachment={
            "type" : Transaction.ATTACHMENT_TYPE_ASSET_TRANSFER,
            "version": 1,
            "asset": asset,
            "quantity": value,
            "status": 2
        };
        output.value= 0;
    }
    this.outputs.push(output);
};

/**
 * Clear the transactions input scripts.
 * @returns {Transaction}
 */
Transaction.prototype.clearInputScripts = function() {
    this.inputs.forEach((input) => {
        input.script = "";
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
 * Encode raw transaction ouputs.
 * @param {Array<Output>} outputs
 * @returns {Buffer} Encoded outputs
 * @throws {Error}
 */
function encodeOutputs(outputs){

    //Initialize buffer and offset
    let offset = 0;
    var buffer = Buffer.allocUnsafe(100000);
    if (outputs.length < 0xfd) {
        offset = buffer.writeUInt8(outputs.length, offset);
    } else if (outputs.length <= 0xffff) {
        offset = buffer.writeInt8(0xfd, offset);
        offset = buffer.writeInt16(outputs.length, offset);
    } else
        throw Error("Wow so many outputs! Get a full node please");

    outputs.forEach((output) => {
        //Write value as 8byte integer
        offset = bufferutils.writeUInt64LE(buffer, output.value, offset);
        //Output script
        //Static transfer stuff
        offset = writeAddress(output.address, buffer, offset);
        // attachment
        offset = buffer.writeUInt32LE(output.attachment.version, offset);
        offset = buffer.writeUInt32LE(output.attachment.type, offset);

        switch (output.attachment.type) {
            case Transaction.ATTACHMENT_TYPE_ETP_TRANSFER:
                break;
            case Transaction.ATTACHMENT_TYPE_ASSET_TRANSFER:
                offset = Transaction.encodeAttachmentAssetTransfer(buffer, offset, output.attachment);
                break;
            default:
                throw Error("What kind of an output is that?!");
        }
    });

    return buffer.slice(0,offset);
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
    if (inputs.length < 0xfd) {
        offset = buffer.writeUInt8(inputs.length, offset);
    } else if (inputs.length <= 0xffff) {
        offset = buffer.writeUInt8(0xfd, offset);
        offset = buffer.writeInt16LE(inputs.length, offset);
    } else
        throw Error("Wow so many inputs!");

    inputs.forEach((input, index) => {
        //Write reversed hash
        offset += new Buffer(input.previous_output.hash, 'hex').reverse().copy(buffer, offset);
        //Index
        offset = buffer.writeUInt32LE(input.previous_output.index, offset);
        if (add_address_to_previous_output_index!==undefined) {
            if (index == add_address_to_previous_output_index) {
                offset = writeAddress(input.previous_output.address, buffer, offset);
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
    return buffer.slice(0,offset);
}

/**
 * Encode the lock time.
 * @param {Number} lock_time
 * @returns {Buffer}
 */
function encodeLockTime(lock_time){
    var buffer = Buffer.allocUnsafe(4);
    buffer.writeInt32LE(lock_time, 0);
    return buffer;
}

/**
 * Helper function to encode the attachment for an asset transfer.
 * @param {Buffer} buffer
 * @param {Number} offset
 * @param {Number} attachment_data_type
 * @returns {Number} New offset
 * @throws {Error}
 */
Transaction.encodeAttachmentAssetTransfer = function(buffer, offset, attachment_data_type) {
    if (attachment_data_type.asset == undefined)
        throw Error('Specify output asset');
    if (attachment_data_type.quantity == undefined)
        throw Error('Specify output quanity');
    offset = buffer.writeUInt32LE(attachment_data_type.status, offset);
    offset = buffer.writeUInt8(attachment_data_type.asset.length, offset);
    offset += new Buffer(attachment_data_type.asset).copy(buffer, offset);
    offset = bufferutils.writeUInt64LE(buffer, attachment_data_type.quantity, offset);
    return offset;
};

/**
 * Enodes the given input script.
 * @param {String} script_string
 * @returns {Buffer}
 */
Transaction.encodeInputScript = function(script_string) {
    var buffer = new Buffer(10000),
        offset = 0;
    //TODO: more general regex
    let operations = script_string.match(/\[ (\w+) \] \[ (\w+) \]/i);
    if (operations != null && operations.length > 1) {
        operations.forEach(function(op, i) {
            if (!i) return;
            var res = new Buffer(op, 'hex');
            offset = buffer.writeUInt8(res.length, offset);
            offset += res.copy(buffer, offset);
        });
    }
    return buffer.slice(0, offset);
};

/**
 * Write an address to the given buffer.
 * @param {String} address
 * @param {Buffer} buffer
 * @param {Number} offset
 * @returns {Number} new offset
 */
function writeAddress(address, buffer, offset){
    offset = buffer.writeUInt8(25, offset);
    offset = buffer.writeUInt8(118, offset);
    offset = buffer.writeUInt8(169, offset);
    offset = buffer.writeUInt8(20, offset);
    //Write previous output address
    offset += new Buffer(base58check.decode(address, 'hex').data, 'hex').copy(buffer, offset);
    //Static transfer stuff
    offset = buffer.writeUInt8(136, offset);
    offset = buffer.writeUInt8(172, offset);
    return offset;
}

module.exports = Transaction;
