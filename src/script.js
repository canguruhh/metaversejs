var assert = require('assert'),
    bufferutils = require('./bufferutils'),
    base58check = require('base58check'),
    OPS = require('metaverse-ops');

const OP_INT_BASE = OPS.OP_1 - 1

let Script = function (buffer, chunks) {
    this.buffer = buffer;
    this.chunks = chunks;
};

Script.fromBuffer = function (buffer) {
    var chunks = [];
    var i = 0;

    while (i < buffer.length) {
        var opcode = buffer.readUInt8(i);
        // data chunk
        if ((opcode > OPS.OP_0) && (opcode <= OPS.OP_PUSHDATA4)) {
            var d = bufferutils.readPushDataInt(buffer, i);

            // did reading a pushDataInt fail? return non-chunked script
            if (d === null) return new Script(buffer, []);
            i += d.size;

            // attempt to read too much data?
            if (i + d.number > buffer.length) return new Script(buffer, []);

            var data = buffer.slice(i, i + d.number);
            i += d.number;
            chunks.push(data);

            // opcode
        } else {
            chunks.push(opcode);
            i++;
        }
    }

    return new Script(buffer, chunks);
};

Script.getAddressFromOutputScript = function (script, network = 'mainnet') {
    let prefix = null;
    switch (Script.getType(script)) {
        case 'attenuation':
        case 'p2pkh':
        case 'lock':
            prefix = (network == 'mainnet') ? '32' : '7F';
            break;
        case 'p2sh':
            prefix = '05';
            break;
        default:
            return undefined;
    }
    let address = / ([0-9a-fA-F]{40}) /.exec(script);
    return (address) ? base58check.encode(address[address.length-1], prefix, 'hex') : undefined;
};

Script.getType = function (script) {
    if (Script.isP2PKH(script)) {
        return 'p2pkh'
    } else if (Script.isP2SH(script)) {
        return 'p2sh'
    } else if (Script.isOpReturn(script)) {
        return 'op_return'
    } else if (Script.isStakeLock(script)) {
        return 'stakelock'
    } else if (Script.isLock(script)) {
        return 'lock'
    } else if (Script.hasAttenuationModel(script)){
        return 'attenuation'
    }
    return 'custom'
};

Script.isLock = function (script) {
    return /^\[ ([0-9a-f]+) \] (?:op_numequalverify|numequalverify) (?:op_dup|dup) (?:op_hash160|hash160) \[ ([0-9a-f]{40}) \] (?:op_equalverify|equalverify) (?:op_checksig|checksig)$/i.test(script);
};

Script.isOpReturn = function (script) {
    return /(?:op_return|return)/i.test(script);
};

Script.isStakeLock = function (script) {
    return /^\[ ([0-9a-f]+) \] (?:op_checksequenceverify|checksequenceverify) (?:op_drop|drop) (?:op_dup|dup) (?:op_hash160|hash160) \[ ([0-9a-f]{40}) \] (?:op_equalverify|equalverify) (?:op_checksig|checksig)$/i.test(script);
};

Script.isP2SH = function (script) {
    return /^(?:op\_hash160|hash160) \[ ([0-9a-f]{40}) \] (?:op\_equal|equal)$/i.test(script);
};

Script.isP2PKH = function (script) {
    return /^(?:op_dup|dup) (?:op_hash160|hash160) \[ ([0-9a-f]{40}) \] (?:op_equalverify|equalverify) (?:op_checksig|checksig)$/i.test(script);
};

Script.fromChunks = function (chunks) {

    var bufferSize = chunks.reduce(function (accum, chunk) {
        // data chunk
        if (Buffer.isBuffer(chunk)) {
            return accum + bufferutils.pushDataSize(chunk.length) + chunk.length;
        }
        // opcode
        return accum + 1;
    }, 0.0);

    var buffer = Buffer.alloc(bufferSize);
    var offset = 0;

    chunks.forEach(function (chunk) {
        // data chunk
        if (Buffer.isBuffer(chunk)) {
            offset += bufferutils.writePushDataInt(buffer, chunk.length, offset);

            chunk.copy(buffer, offset);
            offset += chunk.length;

            // opcode
        } else {
            buffer.writeUInt8(chunk, offset);
            offset += 1;
        }
    });


    assert.equal(offset, buffer.length, 'Could not decode chunks');
    return new Script(buffer, chunks);
};

Script.fromHex = function (hex) {
    return Script.fromBuffer(new Buffer(hex, 'hex'));
};

Script.EMPTY = Script.fromChunks([]);

Script.prototype.toBuffer = function () {
    return this.buffer;
};

Script.prototype.toHex = function () {
    return this.toBuffer().toString('hex');
};

Script.prototype.getType = function () {
    return Script.getType(this.toASM())
}

Script.prototype.toASM = function () {
    var reverseOps = [];
    for (var op in OPS) {
        var code = OPS[op];
        reverseOps[code] = op;
    }

    return this.chunks.map(function (chunk) {
        // data chunk
        if (Buffer.isBuffer(chunk)) {
            return '[ ' + chunk.toString('hex') + ' ]';
            // opcode
        } else {
            return reverseOps[chunk];
        }
    }).join(' ');
};

Script.prototype.getLockLength = function () {
    if (['lock', 'stakelock'].includes(this.getType())) {
        if (!Buffer.isBuffer(this.chunks[0])) throw 'Illegal lock length'
        if (this.chunks[0].length > 4) return -1
        let buffer = new Buffer.from('00000000', 'hex')
        this.chunks[0].copy(buffer, 0)
        return buffer.readInt32LE(0)
    }
    return 0
}

Script.fullnodeFormat = function (script) {
    let level = 0
    script = script.split(' ').map(token => {
        if (token == '[') {
            level++
        } else if (token == ']') {
            level--
        } else if (level == 0) {
            return 'OP_' + token.toUpperCase()
        }
        return token;
    }).join(' ')
    return script
}

Script.fromFullnode = function (script) {
    return Script.fromASM(Script.fullnodeFormat(script))
}

function fromASM(asm) {
    let level = 0
    let chunks = []
    asm.split(' ').forEach(chunkStr => {
        if (chunkStr == '[') level++
        else if (chunkStr == ']') level--
        else {
            if (level == 0) {
                chunkStr = chunkStr.toUpperCase()
                if (OPS[chunkStr]) chunks.push(OPS[chunkStr])
                else if (OPS['OP_' + chunkStr]) chunks.push(OPS['OP_' + chunkStr])
                else throw 'Unknown OP code'
            } else {
                chunks.push(Buffer.from(chunkStr, 'hex'))
            }
        }
    })
    return Script.fromChunks(chunks)
}

Script.fromASM = function (script) {
    script = script.replace(/\s+/g, ' ');
    return fromASM(script);
};

Script.hasAttenuationModel = function (script) {
    let regex = /^\[\ ([a-f0-9]+)\ \]\ \[\ ([a-f0-9]+)\ \]\ (checkattenuationverify|op_checkattenuationverify)\ (dup|op_dup)\ (hash160|op_hash160)\ \[ [a-f0-9]+\ \]\ (equalverify|op_equalverify)\ (checksig|op_checksig)$/gi;
    return regex.test(script);
};

Script.getAttenuationModel = function (script) {
    let regex = /^\[\ ([a-f0-9]+)\ \]\ \[\ ([a-f0-9]+)\ \]\ (checkattenuationverify|op_checkattenuationverify)\ (dup|op_dup)\ (hash160|op_hash160)\ \[ [a-f0-9]+\ \]\ (equalverify|op_equalverify)\ (checksig|op_checksig)$/gi;
    if (Script.hasAttenuationModel(script)) {
        let b = regex.exec(script.match(regex)[0])[1];
        return Buffer.from(b, 'hex').toString();
    }
    return null;
};

Script.getAttenuationParams = function (script) {
    let regex = /^\[\ ([a-f0-9]+)\ \]\ \[\ ([a-f0-9]+)\ \]\ checkattenuationverify\ dup\ hash160\ \[ [a-f0-9]+\ \]\ equalverify\ checksig$/gi;
    if (Script.hasAttenuationModel(script)) {
        let p = regex.exec(script.match(regex)[0]);
        return {
            model: Buffer.from(p[1], 'hex').toString(),

            hash: Buffer.from(p[2].substr(0, 64), 'hex').reverse().toString('hex'),
            index: Buffer.from(p[2].substr(64, 8), 'hex').readInt32LE(0),
        };
    }
    return null;
};

Script.makeAttenuationScript = function (attenuation_string, from_tx, from_index, to_address) {
    let hash = Buffer.from(from_tx || '0000000000000000000000000000000000000000000000000000000000000000', 'hex').reverse();
    let index = Buffer.from('ffffffff', 'hex').writeInt32LE(from_index || 4294967295);;
    return `[ ${attenuation_string} ] [ ${Buffer.concat([hash, index]).toString('hex')} ]  checkattenuationverify dup hash160 [ ${to_address} ] equalverify checksig`;
};

Script.deserializeAttenuationModel = function (string) {
    let tmp = {};
    string.split(';').forEach(part => {
        let t = part.split('=');
        if (t.length == 2) {
            if (t[1].toString().indexOf(',') !== -1)
                tmp[t[0]] = t[1].toString().split(',').map(e => parseInt(e));
            else
                tmp[t[0]] = parseInt(t[1]);
        }
    });
    switch (tmp.TYPE) {
        case 1:
        case 2:
        case 3:
            return tmp;
            break;
        default:
            throw Error('ERR_DESERIALIZE_ATTENUATION_MODEL');
    }
};

Script.serializeAttenuationModel = function (model) {
    let result = '';
    Object.keys(model).forEach(key => {
        result += key + '=' + ((Array.isArray(model[key])) ? model[key].join(',') : model[key]) + ';';
    });
    return result.substr(0, result.length - 1);
};


Script.extractP2SHSignatures = (script) => {
    let regex = /(?:\[ ([a-f0-9]+) \])/gi;
    let signatures = [];
    var xArray;
    while ((xArray = regex.exec(script))) signatures.push(xArray[1]);
    if (signatures.length > 1)
        return signatures.splice(0, signatures.length - 1);
    return [];
};

Script.extractP2SHRedeem = (script) => {
    let regex = /(?:\[ ([a-f0-9]+) \])/gi;
    let signatures = [];
    var xArray;
    while ((xArray = regex.exec(script))) signatures.push(xArray[1]);
    if (signatures.length)
        return signatures[signatures.length - 1];
    return null;
};

Script.combineP2SHSignatures = (signatures, redeem) => {
    let script = "zero ";
    signatures.forEach(s => script += "[ " + s + " ]");
    script += " [ " + redeem + " ]";
    return script;
};

Script.adjustAttenuationModel = function (model, height_delta) {
    if (!height_delta > 0) {
        return model;
    }
    let blocks_left = null;
    switch (model.TYPE) {
        case 1:
            let period_size = model.LP / model.UN;
            blocks_left = model.LH;
            for (let period = model.PN; period < model.UN; period++) {
                if (blocks_left >= height_delta) {
                    model.LH = blocks_left - height_delta;
                    model.PN = period;
                    return model;
                }
                blocks_left += period_size;
            }
            throw Error('ERR_ADJUST_ATTENUATION_MODEL');
            break;
        case 2:
        case 3:
            blocks_left = model.LH;
            for (let period = model.PN; period < model.UC.length; period++) {
                if (blocks_left >= height_delta) {
                    model.LH = blocks_left - height_delta;
                    model.PN = period;
                    return model;
                }
                blocks_left += model.UC[period + 1];
            }
            throw Error('ERR_ADJUST_ATTENUATION_MODEL');
            break;
        default:
            throw Error('ERR_ADJUST_ATTENUATION_MODEL_UNKNOWN_TYPE');
    }

}

module.exports = Script;
