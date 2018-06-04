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
            address: "MJssPCKjLqzrvGGXoyrnw3UN7csSszTmZq"
        },
        {
            value: 3000,
            "attachment": {
                type: 'etp',
            },
            address: "MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3"
        },
        {
            value: 100000,
            "attachment": {
                type: 'asset-transfer',
                symbol: "MVS.ZGC",
                quantity: 20
            },
            address: "MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3"
        },
        {
            value: 2000,
            "attachment": {
                type: 'etp',
            },
            address: "MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve"
        },
        {
            value: 1000,
            "attachment": {
                type: 'etp',
            },
            address: "MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve"
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

    it('Filter for attachment type', () => {
        assert.equal(3, Metaverse.output.filter(utxo, {
            type: 'etp'
        }).length);
    });

    it('Filter for multiple attachment types', () => {
        assert.equal(3, Metaverse.output.filter(utxo, {
            type: ['etp']
        }).length);
    });
    
    it('Filter for address', () => {
        assert.equal(2, Metaverse.output.filter(utxo, {
            address: "MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3"
        }).length);
    });

    it('Filter for multiple addresses', () => {
        assert.equal(4, Metaverse.output.filter(utxo, {
            address: ["MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve","MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3"]
        }).length);
    });
    
    it('Get spendable quanitity of MST lock type 1', () => {
        let output = {attachment: {quantity: 100, type: 'asset-transfer'}, script: '[ 504e3d303b4c483d32303b545950453d313b4c513d31353b4c503d36303b554e3d33 ] [ 1381b4f8e0b1b96170d666a5183480bda9e6af277f34f1d62cd100ee4abf138900000000 ] checkattenuationverify dup hash160 [ 0c215ddce4fd693d94e3f9598b26484a30fce2d3 ] equalverify checksig'};
        //		{ PN: 0, LH: 20, TYPE: 1, LQ: 15, LP: 60, UN: 3 }
        assert.equal(85, Metaverse.output.assetSpendable(output, 0, 0));
        assert.equal(85, Metaverse.output.assetSpendable(output, 0, 19));
        assert.equal(90, Metaverse.output.assetSpendable(output, 0, 20));
        assert.equal(95, Metaverse.output.assetSpendable(output, 0, 40));
        assert.equal(100, Metaverse.output.assetSpendable(output, 0, 60));
        assert.equal(100, Metaverse.output.assetSpendable(output, 0, 1000));
    });
});
