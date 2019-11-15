'use strict';

const bufferutils = require('./bufferutils.js'),
    base58check = require('base58check'),
    Script = require('./script'),
    Constants = require('./constants'),
    OPS = require('metaverse-ops');

class Encoder {

    static UInt32LE(number) {
        var buffer = Buffer.alloc(8);
        return buffer.slice(0, buffer.writeUInt32LE(number, 0));
    }
    static UInt8(number) {
        var buffer = Buffer.alloc(2);
        return buffer.slice(0, buffer.writeUInt8(number, 0));
    }

    static decodeTransaction(transaction, rawtx, network) {
        return fromBuffer(transaction, Buffer.from(rawtx, 'hex'), network);
    }

    static encodeTransaction(tx, prepare_index) {
        return Buffer.concat([
            encodeVersion(tx.version),
            encodeInputs(tx.inputs, prepare_index),
            encodeOutputs(tx.outputs),
            encodeLockTime(tx.lock_time)
        ]);
    }

}

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
        offset += Buffer.from(input.previous_output.hash, 'hex').reverse().copy(buffer, offset);
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
                    } else {
                        if (Script.isP2SH(input.previous_output.script)) {
                            let script_buffer = Buffer.from(input.redeem, 'hex');
                            offset += bufferutils.writeVarInt(buffer, script_buffer.length, offset);
                            offset += script_buffer.copy(buffer, offset);
                        } else {
                            if (input.previous_output.script) {
                                let script_buffer = Script.fromASM(input.previous_output.script).toBuffer()
                                offset += bufferutils.writeVarInt(buffer, script_buffer.length, offset);
                                offset += script_buffer.copy(buffer, offset);
                            } else {
                                offset = writeScriptPayToPubKeyHash(input.previous_output.address, buffer, offset);
                            }
                        }
                    }
                }
            } else {
                offset = buffer.writeUInt8(0, offset);
            }
        } else {
            //input script
            let script_buffer = encodeInputScript(input.script);
            offset += bufferutils.writeVarInt(buffer, script_buffer.length, offset);
            offset += script_buffer.copy(buffer, offset);
        }

        offset = buffer.writeUInt32LE(input.sequence, offset);
    });
    return buffer.slice(0, offset);
}
/**
 * Encode raw transaction ouputs.
 * @param {Array<Output>} outputs
 * @returns {Buffer} Encoded outputs
 * @throws {Error}
 */
function encodeOutputs(outputs) {

    //Initialize buffer and offset
    let offset = 0;
    var buffer = Buffer.allocUnsafe(1000000);
    //Write number of inputs
    offset += bufferutils.writeVarInt(buffer, outputs.length, offset);

    outputs.forEach((output) => {
        //Write value as 8byte integer
        offset = bufferutils.writeUInt64LE(buffer, output.value, offset);
        //Output script
        if (output.script_type) {
            switch (output.script_type) {
                case 'p2sh':
                    offset = writeScriptPayToScriptHash(output.address, buffer, offset);
                    break;
                case 'pubkeyhash':
                    offset = writeScriptPayToPubKeyHash(output.address, buffer, offset);
                    break;
                case 'op_return':
                    offset = writeScriptOpReturn(buffer, offset);
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
        } else if (output.script) {
            let script = Script.fromASM(output.script).buffer;
            offset += bufferutils.writeVarInt(buffer, script.length, offset);
            offset += script.copy(buffer, offset);
        } else {
            throw 'Neither script not script type present';
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
                        offset = encodeAttachmentAssetIssue(buffer, offset, output.attachment);
                        break;
                    case Constants.MST.STATUS.TRANSFER:
                        offset = encodeAttachmentMSTTransfer(buffer, offset, output.attachment.symbol, output.attachment.quantity);
                        break;
                    default:
                        throw Error("Asset status unknown");
                }
                break;
            case Constants.ATTACHMENT.TYPE.MESSAGE:
                offset = encodeAttachmentMessage(buffer, offset, output.attachment.message);
                break;
            case Constants.ATTACHMENT.TYPE.AVATAR:
                offset = encodeAttachmentDid(buffer, offset, output.attachment);
                break;
            case Constants.ATTACHMENT.TYPE.CERT:
                offset = encodeAttachmentCert(buffer, offset, output.attachment);
                break;
            case Constants.ATTACHMENT.TYPE.MIT:
                switch (output.attachment.status) {
                    case Constants.MIT.STATUS.REGISTER:
                        offset = encodeAttachmentMITRegister(buffer, offset, output.attachment.symbol, output.attachment.content, output.attachment.address);
                        break;
                    case Constants.MIT.STATUS.TRANSFER:
                        offset = encodeAttachmentMITTransfer(buffer, offset, output.attachment.symbol, output.attachment.address);
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

function encodeString(buffer, str, offset, encoding = 'utf-8') {
    var payload = Buffer.from(str, encoding);
    offset += bufferutils.writeVarInt(buffer, payload.length, offset);
    return payload.copy(buffer, offset) + 1;
}

/**
 * Encode the lock time.
 * @param {Number} lock_time
 * @returns {Buffer}
 */
function encodeLockTime(lock_time) {
    var buffer = Buffer.alloc(4);
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
function encodeAttachmentMessage(buffer, offset, message) {
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
function encodeAttachmentMSTTransfer(buffer, offset, symbol, quantity) {
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
function encodeAttachmentDid(buffer, offset, attachment_data) {
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
function encodeAttachmentCert(buffer, offset, attachment_data) {
    offset += encodeString(buffer, attachment_data.symbol, offset);
    offset += encodeString(buffer, attachment_data.owner, offset);
    offset += encodeString(buffer, attachment_data.address, offset);
    offset = buffer.writeUInt32LE(attachment_data.cert, offset);
    offset = buffer.writeUInt8(attachment_data.status, offset);
    if (attachment_data.content) {
        offset += encodeString(buffer, attachment_data.content, offset);
    }
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
function encodeAttachmentAssetIssue(buffer, offset, attachment_data) {
    offset = buffer.writeUInt32LE(attachment_data.status, offset);
    //Encode symbol
    offset += encodeString(buffer, attachment_data.symbol, offset);
    //Encode maximum supply
    offset = bufferutils.writeUInt64LE(buffer, attachment_data.max_supply, offset);
    //Encode precision
    offset = buffer.writeUInt8(attachment_data.precision, offset);
    //Encode secondary issue threshold
    if(attachment_data.secondaryissue_threshold == -1)
        attachment_data.secondaryissue_threshold = 127;
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
function encodeAttachmentMITRegister(buffer, offset, symbol, content, address) {
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
function encodeAttachmentMITTransfer(buffer, offset, symbol, address) {
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
function encodeInputScript(parameters) {
    return Script.fromChunks((parameters) ? parameters : []).buffer;
};

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
    offset += Buffer.from(base58check.decode(scripthash, 'hex').data, 'hex').copy(buffer, offset);
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
    offset += Buffer.from(base58check.decode(address, 'hex').data, 'hex').copy(buffer, offset);
    //Static transfer stuff
    offset = buffer.writeUInt8(OPS.OP_EQUALVERIFY, offset);
    offset = buffer.writeUInt8(OPS.OP_CHECKSIG, offset);
    return offset;
}

function writeScriptOpReturn(buffer, offset) {
    offset = buffer.writeUInt8(1, offset); //Script length
    offset = buffer.writeUInt8(OPS.OP_RETURN, offset);
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
    offset += Buffer.from(base58check.decode(address, 'hex').data, 'hex').copy(buffer, offset);
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
    let locktime_buffer = Buffer.from(locktime, 'hex');
    offset = buffer.writeUInt8(27 + locktime_buffer.length, offset); //Script length
    offset = buffer.writeUInt8(locktime_buffer.length, offset); //Length of locktime
    offset += locktime_buffer.copy(buffer, offset);
    offset = buffer.writeUInt8(OPS.OP_NUMEQUALVERIFY, offset);
    offset = buffer.writeUInt8(OPS.OP_DUP, offset);
    offset = buffer.writeUInt8(OPS.OP_HASH160, offset);
    //Write previous output address
    offset = buffer.writeUInt8(20, offset); //Address length
    offset += Buffer.from(base58check.decode(address, 'hex').data, 'hex').copy(buffer, offset);
    offset = buffer.writeUInt8(OPS.OP_EQUALVERIFY, offset);
    offset = buffer.writeUInt8(OPS.OP_CHECKSIG, offset);
    return offset;
}

function fromBuffer(tx, buffer, network) {
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
                        attachment.symbol = readString();
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
                attachment.address = readString();
                if (attachment.status == Constants.MIT.STATUS.REGISTER) {
                    attachment.content = readString();
                }
                break;
            case Constants.ATTACHMENT.TYPE.CERT:
                attachment.symbol = readString();
                attachment.owner = readString();
                attachment.address = readString();
                attachment.cert = readUInt32();
                attachment.status = readUInt8();
                if (certHasContent(attachment.cert)) {
                    attachment.content = readString();
                }
                break;
            case Constants.ATTACHMENT.TYPE.COINSTAKE:
                break;
            default:
                throw 'Unknown attachment type: ' + attachment.type;
        }
        return attachment;
    }

    function certHasContent(certType) {
        switch (certType) {
            case Constants.CERT.TYPE.MINING:
                return true
        }
        return false
    }

    function readGenerationScript() {
        return new Script(readSlice(readVarInt()), []);
    }

    tx.version = readUInt32();

    var input_length = readVarInt();
    for (var i = 0; i < input_length; ++i) {
        tx.inputs.push({
            previous_output: {
                hash: readSlice(32).reverse().toString('hex'),
                index: readUInt32(),
            },
            script: readScript(),
            sequence: readUInt32(),
        });

    }

    var output_length = readVarInt();
    for (i = 0; i < output_length; ++i) {
        let output = {
            value: readUInt64(),
            script: readScript(),
            attachment: readAttachment()
        };
        if (Script.hasAttenuationModel(output.script)) {
            output.script_type = 'attenuation';
            output.attenuation = { model: Script.getAttenuationModel(output.script)}
            output.address = Script.getAddressFromOutputScript(output.script, network)
        }
        output.address = Script.getAddressFromOutputScript(output.script, network);
        tx.outputs.push(output);
    }

    tx.lock_time = readUInt32();

    return tx;
};

module.exports = Encoder;
