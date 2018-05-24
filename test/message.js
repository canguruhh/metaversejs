var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    Metaverse = require('../');

describe('Message', function() {
    it('Ascii values', () => {
        var tx = new Metaverse.transaction();
        tx.version=2;
        tx.addInput("tK8UKnBKhk4NQYhSeSb2zeWgMSZaHsn1TY", "15a3a80a867315ee1d3f1ff67e7d5cd0709b1a1d4a48a938f33b01ec8f47425f", 0);
        tx.addOutput("tLWixVH8zJGcJpJPjo549q75WcyqrudL9d", "ETP", 10000);
        tx.addOutput("tK8UKnBKhk4NQYhSeSb2zeWgMSZaHsn1TY", "ETP", 299980000);
        tx.addMessage("tK8UKnBKhk4NQYhSeSb2zeWgMSZaHsn1TY", "hi sven, this is a message tx");
        tx.encode().toString('hex').should.equal("02000000015f42478fec013bf338a9484a1d1a9b70d05c7d7ef61f3f1dee1573860aa8a3150000000000ffffffff0310270000000000001976a914950d8b7cbec7fdf1f9780cbd00870378b3b8eb0488ac0100000000000000e054e111000000001976a91485e00d90f5d8de5bd3daa30a686c7791affafa1088ac010000000000000000000000000000001976a91485e00d90f5d8de5bd3daa30a686c7791affafa1088ac01000000030000001d6869207376656e2c20746869732069732061206d65737361676520747800000000");
    });
});
