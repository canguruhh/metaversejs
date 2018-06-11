var assert = require('assert');
var bufferutils = require('./bufferutils');
var OPS = require('bitcoin-ops');

let Script = function(buffer, chunks) {
    this.buffer = buffer;
    this.chunks = chunks;
};

Script.fromBuffer = function(buffer) {
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

Script.fromChunks = function(chunks) {

    var bufferSize = chunks.reduce(function(accum, chunk) {
        // data chunk
        if (Buffer.isBuffer(chunk)) {
            return accum + bufferutils.pushDataSize(chunk.length) + chunk.length;
        }
        // opcode
        return accum + 1;
    }, 0.0);

    var buffer = new Buffer(bufferSize);
    var offset = 0;

    chunks.forEach(function(chunk) {
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

Script.fromHex = function(hex) {
    return Script.fromBuffer(new Buffer(hex, 'hex'));
};

Script.EMPTY = Script.fromChunks([]);

Script.prototype.toBuffer = function() {
    return this.buffer;
};

Script.prototype.toHex = function() {
    return this.toBuffer().toString('hex');
};

Script.prototype.toASM = function() {
    var reverseOps = [];
    for (var op in OPS) {
        var code = OPS[op];
        reverseOps[code] = op;
    }

    return this.chunks.map(function(chunk) {
        // data chunk
        if (Buffer.isBuffer(chunk)) {
            return '[ ' + chunk.toString('hex') + ' ]';
            // opcode
        } else {
            return reverseOps[chunk];
        }
    }).join(' ');
};

Script.hasAttenuationModel = function(script) {
    let regex = /^\[\ ([a-f0-9]+)\ \]\ \[\ ([a-f0-9]+)\ \]\ checkattenuationverify\ dup\ hash160\ \[ [a-f0-9]+\ \]\ equalverify\ checksig$/gi;
    return regex.test(script);
};

Script.getAttenuationModel = function(script) {
    let regex = /^\[\ ([a-f0-9]+)\ \]\ \[\ ([a-f0-9]+)\ \]\ checkattenuationverify\ dup\ hash160\ \[ [a-f0-9]+\ \]\ equalverify\ checksig$/gi;
    if (Script.hasAttenuationModel(script)) {
        let b = regex.exec(script.match(regex)[0])[1];
        return Buffer.from(b, 'hex').toString();
    }
    return null;
};

Script.getAttenuationParams = function(script) {
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

Script.makeAttenuationScript = function(attenuation_string, from_tx, from_index, to_address) {
    let hash = Buffer.from(from_tx || '0000000000000000000000000000000000000000000000000000000000000000', 'hex').reverse();
    let index = Buffer.from('ffffffff', 'hex').writeInt32LE(from_index || 4294967295);;
    return `[ ${attenuation_string} ] [ ${Buffer.concat([hash, index]).toString('hex')} ]  checkattenuationverify dup hash160 [ ${to_address} ] equalverify checksig`;
};

Script.deserializeAttenuationModel = function(string) {
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

Script.serializeAttenuationModel = function(model) {
    let result = '';
    Object.keys(model).forEach(key => {
        result += key + '=' + ((Array.isArray(model[key])) ? model[key].join(',') : model[key]) + ';';
    });
    return result.substr(0, result.length - 1);
}

Script.adjustAttenuationModel = function(model, height_delta) {
    if (!height_delta > 0) {
        return model;
    }
    let past_blocks = null;
    switch (model.TYPE) {
        case 1:
            let period_size = model.LP / model.UN;
            past_blocks = period_size - model.LH;
            for (let period = model.PN; period < model.UN; period++) {
                if (past_blocks >= height_delta) {
                    // console.log(height_delta, past_blocks)
                    model.LH = past_blocks - height_delta;
                    model.PN = period;
                    return model;
                }
                past_blocks += period_size;
            }
            break;
        case 2:
        case 3:
            past_blocks = model.UC[model.PN] - model.LH;
            for (let period = model.PN; period < model.UC.length; period++) {
                past_blocks += model.UC[period];
                if (past_blocks >= height_delta) {
                    model.LH = past_blocks - height_delta;
                    model.PN = period;
                    return model;
                }
            }
            throw Error('ERR_ADJUST_ATTENUATION_MODEL');
            break;
        default:
            throw Error('ERR_ADJUST_ATTENUATION_MODEL_UNKNOWN_TYPE');
    }

}

module.exports = Script;
