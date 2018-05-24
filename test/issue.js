var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    Metaverse = require('../');

chai.use(chaiAsPromised);

describe('Issue Asset', function() {

    //Generate the wallet
    var sunshine_wallet;
    beforeEach(() => Metaverse.wallet.fromMnemonic("vapor bridge alert mix group speak desk nurse there primary portion cargo poem swim ecology obvious turn follow prefer wonder entry fatal false antique", 'testnet')
        .then((w) => {
            sunshine_wallet = w;
        })
    );
    //Generate the wallet
    var wallet;
    beforeEach(() => Metaverse.wallet.fromMnemonic("guard cabin two exhibit blue train media heart custom faith keen weasel harbor garbage lecture step impact mom broken coil rocket equip face decline", 'testnet')
               .then((w) => {
                   wallet = w;
                   return wallet;
               })
              );

    it('Issue SUN.SHINE', () => {
        var tx = new Metaverse.transaction();
        tx.version=2;
        tx.addInput("tFKkLFZ5B29CkMLkYcAd85JxZ8v2joXFDJ","01a37d6434dbc7b8bc61665ad5498096a57150a14118a786cccf1ac165a5c6ab", 0);
        tx.addInput("tGXb55CFL4auEVVTA27J16n2AXhRhfDBJh","4bbac9a0653bd42cd8540f1f663c0751e38917dc2beb3c7054ee5e5c50928e85", 0);
        tx.addAssetIssueOutput("SUN.SHINE", 1000000000,4,"coinmaster", "tBcdLMaqR1D3mhyBL7CEWwLPR8yRnPkHBd", "Let it shine");
        tx.addOutput("tFKkLFZ5B29CkMLkYcAd85JxZ8v2joXFDJ", "ETP", 22699990000);
        return sunshine_wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0200000002abc6a565c11acfcc86a71841a15071a5968049d55a6661bcb8c7db34647da301000000006b483045022100ebb3b8d7bf447759dc147c9b9fad31581a1ffad60b51815499c8efbbfefdfd3f02204e2f37214c1949cf8a07c998fde65fb6dc6e61a058bf4f60a804f0f627ec9b3d012103ab680cf98ebcdb09e2b75f053c0aa3342794ecbf651ba7920fba68881a363648ffffffff858e92505c5eee54703ceb2bdc1789e351073c661f0f54d82cd43b65a0c9ba4b000000006b4830450221008246630baf90e1d4b46d555699b065caffce44293730e8da5e13b090546c33fd02200aee090d9f87aac3bc546a367f71e612de591748b559eea36476fb9da41477930121034fefae9e40ccf10d6647700bbcfe786423c250d224378c52b638d5974ba08fd2ffffffff0200000000000000001976a914337236fac71eac309678acf6941ab6c415e36ad888ac0100000002000000010000000953554e2e5348494e4500ca9a3b00000000040000000a636f696e6d617374657222744263644c4d6171523144336d6879424c37434557774c50523879526e506b4842640c4c6574206974207368696e65f05b0649050000001976a9145c217d05090c6784c9bfdd78692e64994f20c92488ac010000000000000000000000");
    });

    it('Issue THE.TIMES', () => {
        var tx = new Metaverse.transaction();
        tx.version=2;
        tx.addInput("tQCK1zZS886mgLpdDJj7Ak3BhRRdgti3KT","815c234ac4c0fc666db2f51db73be9942776a09b268a18b90828186c033696ec", 0);
        tx.addAssetIssueOutput("THE.TIMES", 1000000000,4,"satoshi", "tQCK1zZS886mgLpdDJj7Ak3BhRRdgti3KT", "ETP classic coin");
        tx.addOutput("tQCK1zZS886mgLpdDJj7Ak3BhRRdgti3KT", "ETP", 21999990000);
        return wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0200000001ec9636036c182808b9188a269ba0762794e93bb71df5b26d66fcc0c44a235c81000000006b483045022100e9a3cd1b361166557223c3a13cfd3fc0e234e054443eba4ae05094e32cc8359402201410026dfaa9a356aaad4d4d3fce10f936898aa0190dd1823e29d1141d8f1b3801210390b708696f6ddd7a716e41155f783f4189c671370d5a28f1e13b0fa402c49ab9ffffffff0200000000000000001976a914bd7293b2cda8473a97d5c7694c7b17da76e9ddab88ac010000000200000001000000095448452e54494d455300ca9a3b0000000004000000077361746f736869227451434b317a5a533838366d674c7064444a6a37416b334268525264677469334b541045545020636c617373696320636f696ef0344d1f050000001976a914bd7293b2cda8473a97d5c7694c7b17da76e9ddab88ac010000000000000000000000");
    });
});

