var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised");
var assert = require('assert');
var Metaverse = require('../');
chai.use(chaiAsPromised);

describe('Wallet recreation', function () {
    var signed_tx, wallet;
    beforeEach(function (done) {
        var w = Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero")
            .then((w) => {
                wallet = w;
                var tx = new Metaverse.transaction();
                tx.version = 2;
                tx.inputs = [{
                    "address": "MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf",
                    "previous_output": {
                        "address": "MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf",
                        "hash": "c9c32b0723a57ce087f42df5bb5f98db404a886ef651842f844d59eca6412b27",
                        "index": 0
                    },
                    "script": "",
                    "sequence": 4294967295
                },
                {
                    "address": "MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB",
                    "previous_output": {
                        "address": "MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB",
                        "hash": "707cd4f639e292bd7cbf15c40e9c86d3bbec4c505ca09f6a72eded8313a927be",
                        "index": 1
                    },
                    "script": "",
                    "sequence": 4294967295
                }
                ];
                tx.outputs = [{
                    "index": 0,
                    "address": "MVpxH8aAa3BAXvbdqUUJwEP6s2ajGKKtyd",
                    "script_type": "pubkeyhash",
                    "value": 729995,
                    "attachment": {
                        type: 0,
                        version: 1
                    }
                },
                {
                    "index": 1,
                    "address": "MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf",
                    "script_type": "pubkeyhash",
                    "value": 619995,
                    "attachment": {
                        type: 0,
                        version: 1
                    }
                }
                ];
                return wallet.sign(tx);
            })
            .then((stx) => {
                return stx.encode()
            })
            .then((signed_raw_tx) => {
                signed_tx = signed_raw_tx.toString('hex');
                done();
            });
    });


    it('Wallet can be generated from mnemonic', () => {
        assert.equal(wallet.getAddress(1), "MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf");
    });

    it('signed raw transaction equals test target', () => {
        assert.equal(signed_tx, "0200000002272b41a6ec594d842f8451f66e884a40db985fbbf52df487e07ca523072bc3c9000000006b483045022100b71e952543ad8d937b9460a0d690132dbc8977f077ced43c4914665698868d5102202547633e9a914b68946db1b6007fad1b35e2c22f6dd014caf45da3860433b4c30121035550f8c20e914c4989dcd3521dccd4def479ff8d8e147ecf366cbd196e658712ffffffffbe27a91383eded726a9fa05c504cecbbd3869c0ec415bf7cbd92e239f6d47c70010000006b483045022100e5067916c7447bca7bb339d1e48ca54e6c84a21c244c9efb05904f71006ad2df02200a72348fb082c42bf707cc2e12288757e0f7cb81fdcdfea0ac21dc2c1e4855910121034593f54b073ed6a3728056d0f6595d614c717c639a9301761de7c8ef5d5fe1b4ffffffff028b230b00000000001976a914f087200b95bd043a134a0cead903e0a3600d79eb88ac0100000000000000db750900000000001976a914e782fbba93466771c63d7a9fcc54d85efa26fd3488ac010000000000000000000000");
    });

})

describe('Key operations', function () {
    it('create node from WIF', () => {
        var wif = 'L4gHAbCrWqTneuWJVmjLjFQck7jtkBQzGvmbvvJJEs21LJy1Tp2h';
        assert.equal(Metaverse.wallet.getNodeFromWIF(wif).toWIF(), wif);
    });
});

describe('Public key operations', function () {
    it('Extract xpub', async () => {
        const wallet = await Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero")
        chai.expect(wallet.getMasterPublicKey()).equal('xpub661MyMwAqRbcFGEYvcM26P4niKVBVM9GyVpo6zV8h5bEP2fYLeiTBESZC164gQwznARj6YaNAh3zACWigRLRenpXLbDqrHxXoRJQmDgvnxk');
    });
});