var assert = require('assert');
var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    Metaverse = require('../');
chai.use(chaiAsPromised);

describe('Digital identity', function() {

    //Generate the wallet
    var wallet;
    beforeEach(() => Metaverse.wallet.fromMnemonic("butter vacuum breeze glow virtual mutual veteran argue want pipe elite blast judge write sand toilet file joy exotic reflect truck topic receive wait", 'testnet')
        .then((w) => {
            wallet = w;
            return wallet;
        })
    );

    it('Issue avatar', () => {
        var tx = new Metaverse.transaction();
        tx.addInput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "b5edf3816eba71c93f734e0ec14c814b9128325b4b1b681931af884ce8d6b2b1", 0);
        tx.addDidIssueOutput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "cangr", "tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz");
        tx.addOutput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "ETP", 89074822);
        return wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0400000001b1b2d6e84c88af3119681b4b5b3228914b814cc10e4e733fc971ba6e81f3edb5000000006b48304502210083d6741456e1ad3c81f722a4c64033151c6f9c7519f117200a85e9160b1b7b9402207e2a9f2ccf3b549fefbd6aaac29bc1a525e8e522265af49f9b274f22f7d4abab012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8ffffffff0200000000000000001976a91448b6adc8508180d58d2efe4a6068e7934fdf8b3088ac0100000004000000010000000563616e67722274445a35594d4c4a337a365662764173583163386f6539684a326e4e44346a737a7a862c4f05000000001976a91448b6adc8508180d58d2efe4a6068e7934fdf8b3088ac010000000000000000000000");
    });

});
