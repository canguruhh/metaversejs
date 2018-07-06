var assert = require('assert');
var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    Metaverse = require('../');
chai.use(chaiAsPromised);

describe('Message Signing', function() {

    //Generate the wallet
    var wallet;
    beforeEach(() => Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero", 'testnet')
        .then((w) => {
            wallet = w;
            return wallet;
        })
              );

    const MESSAGE = "Metaverse messaging is a lot of fun!";
    const ADDRESS = "tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ";
    it('Verify signed message', () => {
        return wallet.signMessage("tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ", MESSAGE, true)
            .then(signature=>Metaverse.message.verify(MESSAGE, ADDRESS, signature))
            .should.become(true);
    });
    it('Detect wrong signature', () => {
        return wallet.signMessage("tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ", MESSAGE+"X", true)
            .then(signature=>Metaverse.message.verify(MESSAGE, ADDRESS, signature))
            .should.become(false);
    });
});
