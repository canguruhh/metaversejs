var assert = require('assert')
var Metaverse = require('../index.js');
var request = require('request');

const HOST = 'https://explorer.mvs.org/api/';

describe('Transaction building', function() {

    var inputs = [],
        outputs = [],
        tx_info,
        utxo = [];

    before(function(done) {
        var builder = new Metaverse.transaction_builder();

        getInOuts(["MEXMMsiaWnW8UyukA7SeTRYR1i6oonahxa"])
            .then((response) => {
                let ioputs = JSON.parse(response).result;
                outputs = ioputs[1];
                inputs = ioputs[0];
                return Metaverse.transaction_builder.filterUtxo(outputs, inputs);
            })
            .then((u)=>{
                utxo=u;
                return Metaverse.transaction_builder.findUtxo(utxo, "ETP", 1);
            })
            .then((result)=>{
                tx_info=result;
                done();
            });
    });

    it('Outputs can be loaded', () => {
        assert.notEqual(outputs.length, 0);
    });

    it('Inputs can be loaded', () => {
        assert.notEqual(inputs.length, 0);
    });

    it('UTXO are filtered correctly', () => {
        assert.notEqual(utxo.length, 0);
    });
    
    it('UTXO are chosen correctly', () => {
        assert.equal(1+Metaverse.transaction.DEFAULT_FEE, tx_info.outputs[0].value+tx_info.change['ETP']);
    });
});

function getInOuts(addresses) {
    return new Promise((resolve,reject)=>{
        
        var string = 'inouts?';
        addresses.forEach((address) => {
            string += 'addresses[]=' + address;
        });
        request.get(HOST+string, function(err,_,body){
            if(err) throw err;
            else resolve(body);
        });
    })
}
