var assert = require('assert');
var Metaverse = require('../index.js');
var request = require('request');

describe('Transaction building', function() {

        var tx_info=null;

    before(function(done) {
        var builder = new Metaverse.transaction_builder();

        Promise.resolve([
        {value: 100000, "attachment": {type:'asset-transfer', symbol: "MVS.ZDC", quantity: 2000 },},
            {value: 100000, "attachment": {type:'asset-transfer', symbol: "MVS.ZGC", quantity: 20 },}])
            .then((utxo)=>{
                return Metaverse.transaction_builder.findUtxo(utxo, { ETP: 1 + Metaverse.transaction.DEFAULT_FEE});
            })
            .then((result)=>{
                tx_info=result;
                done();
            });
    });

    it('UTXO are chosen correctly', () => {
        assert.equal(1+Metaverse.transaction.DEFAULT_FEE, tx_info.utxo[0].value+tx_info.change['ETP']);
    });
});
