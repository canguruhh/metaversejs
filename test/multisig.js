var chai = require("chai"),
    expect = chai.expect,
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    networks = require('../src/networks'),
    Metaverse = require('../');

chai.use(chaiAsPromised);

describe('Multisignature', function() {

    //Generate the wallet
    var wallet;
    beforeEach(() => Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero", "testnet")
        .then((w) => {
            wallet = w;
            return wallet;
        })
    );
    it('Multisignature address check', () => {
        expect(Metaverse.multisig.isMultisigAddress('3abc')).to.equal(false);
        expect(Metaverse.multisig.isMultisigAddress('3abcde12345')).to.equal(false);
        expect(Metaverse.multisig.isMultisigAddress('MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB')).to.equal(false);
        expect(Metaverse.multisig.isMultisigAddress('3KXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB')).to.equal(true);
        expect(Metaverse.multisig.isMultisigAddress('3KXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB3434')).to.equal(false);
    });
    it('Generate multisignature wallet', () => {
        let multisig = Metaverse.multisig.generate(2, ['035451cebcc2a7fd1058c90ab6df818f083d72362682350b80827037ab3aec70e3', '036f5cd17f3c6ed0968d248366e90c03ffb8ceb1c86df2c91d1ec7ee78f7e5b18d', '037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c']);
        return Promise.resolve(multisig.address)
            .should.become("3HvBi1ecp1yep6geL91pPDHgREFnNcSJTh");
    });
    it('Send ETP to multisig address', () => {
        var tx = new Metaverse.transaction();
        tx.addInput("t9rpuoySrPJH46GkpdUtJMCyvfuR9XKa8N", "76ca866e7eba8fd0d49b23739debd4f24210e6079a7bbe70fd33c545a694c751", 1);
        tx.addInput("t9rpuoySrPJH46GkpdUtJMCyvfuR9XKa8N", "76ca866e7eba8fd0d49b23739debd4f24210e6079a7bbe70fd33c545a694c751", 0, "[ 32 ] numequalverify dup hash160 [ 20317353b6e296cd9d1545134f2d5afdee00f7ae ] equalverify checksig");
        tx.addOutput("3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX", "ETP", 100000);
        tx.addOutput("t9rpuoySrPJH46GkpdUtJMCyvfuR9XKa8N", "ETP", 108086697192);
        return wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("040000000251c794a645c533fd70be7b9a07e61042f2d4eb9d73239bd4d08fba7e6e86ca76010000006b483045022100ee885d943dbe1fb330b61049420ee4ca76b29a39b23f3f1f005bfaa772c1444e02201ec6cf44b2346da69e42be88bcd4d9785e739dbe6130e435418a189bdee6fa71012103731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9ffffffff51c794a645c533fd70be7b9a07e61042f2d4eb9d73239bd4d08fba7e6e86ca76000000006d483045022100819b65c1dd1b51a9714128493e3762399c2ab1722cf0372dd3f0c0f7c31cace80220674ce308f2a12d41c613f7ac33ccd8f9f0c0fc620f016ebd37e8e160e411b84b012103731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca90132ffffffff02a08601000000000017a914fb142c5346a3a8091ad9fb70918a81b55b1ef774870100000000000000e81c782a190000001976a91420317353b6e296cd9d1545134f2d5afdee00f7ae88ac010000000000000000000000");
    });

});
