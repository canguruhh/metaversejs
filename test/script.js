var chai = require("chai"),
    expect = chai.expect,
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    Metaverse = require('../');

chai.use(chaiAsPromised);

describe('Script', function() {
    const p2pkh = [
        "OP_DUP OP_HASH160 [ 3282bd54b4a4b8cd577926fff45954ff0e002535 ] OP_EQUALVERIFY OP_CHECKSIG",
        "dup hash160 [ 3282bd54b4a4b8cd577926fff45954ff0e002535 ] equalverify checksig"
    ],
    p2sh = [
        "OP_HASH160 [ fb142c5346a3a8091ad9fb70918a81b55b1ef774 ] OP_EQUAL",
        "hash160 [ 5ab9a731c4df5c51d0fe395928b3da03ff4ece7d ] equal"
    ],
    lock = [
        "[ 32 ] numequalverify dup hash160 [ 4700cec0e9bcc3cfe137eba720cdf72670ad27f8 ] equalverify checksig"
    ],
    stakelock = [
        '[ 04 ] checksequenceverify drop dup hash160 [ 3e995f80739ecbfad8d92e3e523c540bd2847ffd ] equalverify checksig',
        '[ 1004 ] checksequenceverify drop dup hash160 [ 3e995f80739ecbfad8d92e3e523c540bd2847ffd ] equalverify checksig',
    ], 
    others = [
        "dsafhdksfhhfkdsa",
        "dsfaklj dslkfjadlk flk  dsljfalsdfjaflksdajfl ljdfsal df"
    ];
    it('Detect P2PKH script', () => {
        p2pkh.forEach(s=>chai.expect(Metaverse.script.isP2PKH(s)).to.equal(true));
        p2sh.concat(lock, others).forEach(s=>chai.expect(Metaverse.script.isP2PKH(s)).to.equal(false));
    });
    it('Detect P2SH script', () => {
        p2sh.forEach(s=>chai.expect(Metaverse.script.isP2SH(s)).to.equal(true));
        p2pkh.concat(lock, others).forEach(s=>chai.expect(Metaverse.script.isP2SH(s)).to.equal(false));
    });
    it('Detect lock script', () => {
        lock.forEach(s=>chai.expect(Metaverse.script.isLock(s)).to.equal(true));
        [].concat(p2pkh, others, p2sh, stakelock).forEach(s=>chai.expect(Metaverse.script.isLock(s)).to.equal(false));
    });
    it('Detect stakelock script', () => {
        stakelock.forEach(s=>chai.expect(Metaverse.script.isStakeLock(s)).to.equal(true));
        [].concat(p2pkh, others, p2sh, lock).forEach(s=>chai.expect(Metaverse.script.isStakeLock(s)).to.equal(false));
    });
    it('Get script type', () => {
        lock.forEach(s=>chai.expect(Metaverse.script.getType(s)).to.equal('lock'));
        p2sh.forEach(s=>chai.expect(Metaverse.script.getType(s)).to.equal('p2sh'));
        lock.forEach(s=>chai.expect(Metaverse.script.getType(s)).to.equal('lock'));
        others.forEach(s=>chai.expect(Metaverse.script.getType(s)).to.equal('custom'));
    });
    it('Get address from script', () => {
        expect(Metaverse.script.getAddressFromOutputScript("dup hash160 [ 4700cec0e9bcc3cfe137eba720cdf72670ad27f8 ] equalverify checksig", 'testnet')).to.equal('tDQ2zXVeVAaJEfiKJg6PNHSyw4ssvwHeks');
        expect(Metaverse.script.getAddressFromOutputScript("dup hash160 [ 3282bd54b4a4b8cd577926fff45954ff0e002535 ] equalverify checksig")).to.equal('MCWEdy1iLVaoVyffgrQbgvbRAZDFWkFQ1q');
        expect(Metaverse.script.getAddressFromOutputScript("OP_HASH160 [ fb142c5346a3a8091ad9fb70918a81b55b1ef774 ] OP_EQUAL")).to.equal('3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX');
    });
    it('Transform fullnode script', ()=>{
        expect(Metaverse.script.fullnodeFormat("dup hash160 [ 4700cec0e9bcc3cfe137eba720cdf72670ad27f8 ] equalverify checksig")).to.equal('OP_DUP OP_HASH160 [ 4700cec0e9bcc3cfe137eba720cdf72670ad27f8 ] OP_EQUALVERIFY OP_CHECKSIG');
    })
});
