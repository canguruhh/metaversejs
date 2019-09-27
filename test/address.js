var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    Metaverse = require('../');

chai.use(chaiAsPromised);

describe('Address', function() {
    it('validate mainnet addresses', () => {
        chai.expect(Metaverse.address.validate('MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB')).equals(true);
        chai.expect(Metaverse.address.validate('3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX')).equals(true);
        chai.expect(Metaverse.address.validate('32izggYE1BEk96HgByvHjNt7MhvxbaQvvU')).equals(true);
    });
    it('validate testnet addresses', () => {
        chai.expect(Metaverse.address.validate('tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz', 'testnet')).equals(true);
        chai.expect(Metaverse.address.validate('tFHAbeiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz', 'testnet')).equals(false);
        chai.expect(Metaverse.address.validate('3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX', 'testnet')).equals(true);
        chai.expect(Metaverse.address.validate('32izggYE1BEk96HgByvHjNt7MhvxbaQvvU', 'testnet')).equals(true);
    });
    it('detect invalid mainnet addresses', () => {
        chai.expect(function(){return Metaverse.address.validate('tFHAbeiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz', 'mainnet', true);}).to.throw('Invalid checksum');
        chai.expect(function(){return Metaverse.address.validate('tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz', 'mainnet', true);}).to.throw('Prefix mismatch');
        chai.expect(Metaverse.address.validate('tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz')).equals(false);
        chai.expect(Metaverse.address.validate('MFfEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB')).equals(false);
    });
    it('detect invalid testnet addresses', () => {
        chai.expect(function(){return Metaverse.address.validate('tFHAbeiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz', 'testnet', true);}).to.throw('Invalid checksum');
        chai.expect(function(){return Metaverse.address.validate('MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB', 'testnet', true);}).to.throw('Prefix mismatch');
        chai.expect(Metaverse.address.validate('tFHAbeiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz', 'testnet')).equals(false);
        chai.expect(Metaverse.address.validate('MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB', 'testnet')).equals(false);
    });
});
