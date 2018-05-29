var assert = require('assert');
var Metaverse = require('../index.js');
var request = require('request');

describe('Outputs', function() {

    var tx_info = null;
    var utxo = [{
            value: 0,
            "attachment": {
                type: 'asset-transfer',
                symbol: "MVS.HUG",
                quantity: 2
            },
        },
        {
            value: 3000,
            "attachment": {
                type: 'etp',
            },
        },
        {
            value: 100000,
            "attachment": {
                type: 'asset-transfer',
                symbol: "MVS.ZGC",
                quantity: 20
            },
        },
        {
            value: 2000,
            "attachment": {
                type: 'etp',
            },
        },
        {
            value: 1000,
            "attachment": {
                type: 'etp',
            },
        }
    ];

    before(function(done) {
        Promise.resolve(utxo)
            .then((utxo) => {
                return Metaverse.output.findUtxo(utxo, {
                    ETP: 1
                }, 0);
            })
            .then((result) => {
                tx_info = result;
                done();
            });
    });

    it('UTXO are chosen correctly', () => {
        assert.equal(1 + Metaverse.transaction.DEFAULT_FEE, tx_info.utxo[0].value + tx_info.change['ETP']);
    });

    it('UTXO filter for attachment type', () => {
        assert.equal(3, Metaverse.output.filter(utxo, {
            type: 'etp'
        }).length);
    });

    it('UTXO filter for multiple attachment types', () => {
        assert.equal(3, Metaverse.output.filter(utxo, {
            type: ['etp']
        }).length);
    });
});
