var chai = require("chai"),
    expect = chai.expect,
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    networks = require('../src/networks'),
    Metaverse = require('../');

chai.use(chaiAsPromised);

describe('Multisignature', function() {

    it('Multisignature address check', () => {
        expect(Metaverse.multisig.isMultisigAddress('3abc')).to.equal(false);
        expect(Metaverse.multisig.isMultisigAddress('3abcde12345')).to.equal(false);
        expect(Metaverse.multisig.isMultisigAddress('MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB')).to.equal(false);
        expect(Metaverse.multisig.isMultisigAddress('3KXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB')).to.equal(true);
        expect(Metaverse.multisig.isMultisigAddress('3KXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB3434')).to.equal(false);
    });
    it('Generate multisignature wallet', () => {
        let multisig = Metaverse.multisig.generate(2, ['035451cebcc2a7fd1058c90ab6df818f083d72362682350b80827037ab3aec70e3','036f5cd17f3c6ed0968d248366e90c03ffb8ceb1c86df2c91d1ec7ee78f7e5b18d','037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c']);
        return Promise.resolve(multisig.address)
            .should.become("3HvBi1ecp1yep6geL91pPDHgREFnNcSJTh");
    });
});
