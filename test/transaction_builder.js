var assert = require('assert');
var Metaverse = require('../index.js');
var request = require('request');

describe('Outputs', function() {

    var tx_info = null;

    before(function(done) {
        Promise.resolve([{
                    value: 0,
                    "attachment": {
                        type: 'asset-transfer',
                        symbol: "MVS.HUG",
                        quantity: 2
                    },
                },
                {
                    value: 100000,
                    "attachment": {
                        type: 'asset-transfer',
                        symbol: "MVS.ZGC",
                        quantity: 20
                    },
                }
            ])
            .then((utxo) => {
                return Metaverse.output.findUtxo(utxo, {
                    ETP: 1
                },0);
            })
            .then((result) => {
                tx_info = result;
                done();
            });
    });

    it('UTXO are chosen correctly', () => {
        assert.equal(1 + Metaverse.transaction.DEFAULT_FEE, tx_info.utxo[0].value + tx_info.change['ETP']);
    });
});
