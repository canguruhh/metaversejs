var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    Metaverse = require('../');

var assert = require('assert');

chai.use(chaiAsPromised);

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
            height: 1000,
            tx: '8b0a4b0995aec25e0742e1a6c3840dcea212f38a9fa388f90e9c89f92f13dcfe',
            index: 5,
            script: '[ 504e3d303b4c483d313b545950453d323b4c513d31353b4c503d3130303b554e3d333b55433d312c392c39303b55513d352c352c35 ] [ 0000000000000000000000000000000000000000000000000000000000000000ffffffff ] checkattenuationverify dup hash160 [ 0c9c9a42df0a7036a9e1ddc5a4473c00c2f5816d ] equalverify checksig',
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

    it('Locked asset detection', () => {
        return Metaverse.output.findUtxo(utxo, {
                'MVS.ZGC': 1
            }, 1001)
            .then(result => result.lockedAssetChange[0].quantity)
            .should.become(10);
    });

    it('UTXO are chosen correctly', () => {
        return Metaverse.output.findUtxo(utxo, {
                ETP: 1
            }, 0)
            .then(tx_info => tx_info.utxo[0].value + tx_info.change['ETP'])
            .should.become(1 + Metaverse.constants.FEE.DEFAULT);
    });

    it('Filter for attachment type', () => {
        return Promise.resolve(Metaverse.output.filter(utxo, {
                type: 'etp'
            }).length)
            .should.become(3);
    });

    it('Filter for multiple attachment types', () => {
        return Promise.resolve(Metaverse.output.filter(utxo, {
                type: ['etp']
            }).length)
            .should.become(3);
    });

    it('Filter for address', () => {
        return Promise.resolve(Metaverse.output.filter(utxo, {
                address: "MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3"
            }).length)
            .should.become(2);
    });

    it('Filter for multiple addresses', () => {
        return Promise.resolve(Metaverse.output.filter(utxo, {
                address: ["MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve", "MSCHL3unfVqzsZbRVCJ3yVp7RgAmXiuGN3"]
            }).length)
            .should.become(4);
    });
});

describe('Attenuation models', function() {
    it('Get spendable quantity of type 1', () => {
        let output = {
            attachment: {
                quantity: 100,
                type: 'asset-transfer'
            },
            script: '[ 504e3d303b4c483d32303b545950453d313b4c513d31353b4c503d36303b554e3d33 ] [ 1381b4f8e0b1b96170d666a5183480bda9e6af277f34f1d62cd100ee4abf138900000000 ] checkattenuationverify dup hash160 [ 0c215ddce4fd693d94e3f9598b26484a30fce2d3 ] equalverify checksig'
        };
        //		{ PN: 0, LH: 20, TYPE: 1, LQ: 15, LP: 60, UN: 3 }
        assert.equal(85, Metaverse.output.assetSpendable(output, 0, 0));
        assert.equal(85, Metaverse.output.assetSpendable(output, 0, 19));
        assert.equal(90, Metaverse.output.assetSpendable(output, 0, 20));
        assert.equal(95, Metaverse.output.assetSpendable(output, 0, 40));
        assert.equal(100, Metaverse.output.assetSpendable(output, 0, 60));
        assert.equal(100, Metaverse.output.assetSpendable(output, 0, 1000));
    });
    it('Get spendable quantity of type 2', () => {
        let output = {
            attachment: {
                quantity: 20,
                type: 'asset-transfer'
            },
            script: '[ 504e3d313b4c483d393b545950453d323b4c513d31353b4c503d3130303b554e3d333b55433d312c392c39303b55513d352c352c35 ] [ d6816665c76afd8a66491686bc65476343ee21a1d6826b245457d29e2381eea700000000 ] checkattenuationverify dup hash160 [ 0c9c9a42df0a7036a9e1ddc5a4473c00c2f5816d ] equalverify checksig'
        };
        //{"PN":1,"LH":9,"TYPE":2,"LQ":15,"LP":100,"UN":3,"UC":[1,9,90],"UQ":[5,5,5]}
        assert.equal(10, Metaverse.output.assetSpendable(output, 0, 8));
        assert.equal(15, Metaverse.output.assetSpendable(output, 0, 9));
        assert.equal(15, Metaverse.output.assetSpendable(output, 0, 98));
        assert.equal(20, Metaverse.output.assetSpendable(output, 0, 99));
    });
});
