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

function encodeVersion(version) {
    var buffer = Buffer.allocUnsafe(4);
    buffer.writeInt32LE(version, 0);
    return buffer;
}

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
                offset = Transaction.encodeAttachmentAssetTransfer(buffer, offset, output.attachment.attachment_data_type);
                break;
            default:
                throw Error("What kind of an output is that?!");
        }
    });

    return buffer.slice(0,offset);
}

function encodeInputs(inputs, previous_output_index) {
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

        if (previous_output_index!==undefined) {
            if (index == previous_output_index) {
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

function encodeLockTime(lock_time){
    var buffer = Buffer.allocUnsafe(4);
    buffer.writeInt32LE(lock_time, 0);
    return buffer;
}

Transaction.prototype.encode = function(add_address_to_previous_output) {
    return Buffer.concat([
        encodeVersion(this.version),
        encodeInputs(this.inputs, add_address_to_previous_output),
        encodeOutputs(this.outputs),
        encodeLockTime(this.lock_time)
    ]);
}

Transaction.prototype.clearInputScripts = function() {
    this.inputs.forEach((input) => {
        input.script = "";
    });
    return this;
}

Transaction.encodeAttachmentAssetTransfer = function(buffer, offset, attachment_data_type) {
    if (attachment_data_type.asset_data_type.address == undefined)
        throw Error('Specify output address');
    if (attachment_data_type.asset_data_type.quantity == undefined)
        throw Error('Specify output quanity');
    offset = buffer.writeUInt32LE(attachment_data_type.status, offset);
    offset = buffer.writeUInt8(attachment_data_type.asset_data_type.address.length, offset);
    offset += new Buffer(attachment_data_type.asset_data_type.address).copy(buffer, offset);
    offset = bufferutils.writeUInt64LE(buffer, attachment_data_type.asset_data_type.quantity, offset);
    return offset;
}

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
}

module.exports = Transaction;
