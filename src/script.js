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

Script.getAttenuationModel = function(script) {
    let regex = /^\[\ ([a-f0-9]+)\ \]\ \[\ ([a-f0-9]+)\ \]\ checkattenuationverify\ dup\ hash160\ \[ [a-f0-9]+\ \]\ equalverify\ checksig$/gi;
    if (regex.test(script)) {
        let b = regex.exec(script.match(regex)[0])[1];
        return Buffer.from(b, 'hex').toString();
    }
    return null;
};

Script.deserializeAttenuationModel = function(string) {
    let tmp = {};
    string.split(';').forEach(part => {
        let t = part.split('=');
        if (t.length == 2)
            tmp[t[0]] = parseInt(t[1]);
    });
    switch (tmp.TYPE) {
        case 1:
            return tmp;
            break;
        default:
            throw Error('ERR_DESERIALIZE_ATTENUATION_MODEL');
    }
}

module.exports = Script;
