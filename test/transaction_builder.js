var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    Metaverse = require('../');

chai.use(chaiAsPromised);

describe('Transaction builder', function() {

    //Generate the wallet
    var wallet;
    beforeEach(() => Metaverse.wallet.fromMnemonic("butter vacuum breeze glow virtual mutual veteran argue want pipe elite blast judge write sand toilet file joy exotic reflect truck topic receive wait", 'testnet')
        .then((w) => {
            wallet = w;
        })
    );

    it('Issue subdomain asset', () => {
        var inputs = [
            {
                address: "tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz",
                hash: "f9c6bf38dd9dbe64844b950b48a3aa70530f550673eaee150a7a50f84d6450c6",
                index: 0,
                value: 189074822
            },
            {
                address: "tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz",
                hash: "d551f4ac862b5de164254d368b27c78b9e9b4e50d5763bc70a472b854bb77231",
                index: 0,
                value: 189074822
            },
            {
                address: "tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz",
                hash: "41fec6250081fce0d5ad435605e4ecce6ed1615f76e917baa365fe57998241aa",
                index: 0,
                value: 189074822
            },
            {
                address: "tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz",
                hash: "336c4126b77531b800a8ddb36e111c98c69a9eb29bf8d072697d8f79fdffd6c1",
                index: 0,
                value: 189074822
            },
            {
                address: "tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz",
                hash: "03cd7bfd3ae420b78fa032fdcf59413461d69804d6455c03228b917437f7f70a",
                index: 0,
                value: 189074822
            },
            {
                address: "tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz",
                hash: "fcfa1c73d66024faa83a93bf31bcee9eb0aa0c43d1edf7e8660e9cae21c901aa",
                index: 0,
                value: 189074822
            },
            {
                address: "tGBMcLr6dwfaMaoYiJgtZ3cYUbbGsbpb8t",
                hash: "2e953ff25a4c8f6026a1dfeb681d8e0106efc4c35b03602ba847532070314df1",
                attachment:{
                    type: 'asset-cert',
                    cert_type: 'domain',
                    symbol: "SUPER",
                    to_did: 'nova',
                    from_did: 'nova',
                    owner: 'nova'
                },
                index: 2,
                value: 0
            },
        ]; 
        return Metaverse.transaction_builder.issueAsset(inputs, "tGBMcLr6dwfaMaoYiJgtZ3cYUbbGsbpb8t", "SUPER.NOVA", 10, 0, "nova", "Supernova is comming", 0, false, "tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz", {"ETP": -134448932})
            .then(tx=>wallet.sign(tx))
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0400000007c650644df8507a0a15eeea7306550f5370aaa3480b954b8464be9ddd38bfc6f9000000006a4730440220395e0013fb9d5c0c97e02d716c7cd66a6a8791455aef0b4cd4ccbfb3ee4bfbe8022078c7b895d0daa904bc5ba9e622f2ce984f457189ac573d48e5bf93348f8c06ee012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016beffffffff3172b74b852b470ac73b76d5504e9b9e8bc7278b364d2564e15d2b86acf451d5000000006a4730440220509f6bdadcc55db84c1272eea4b4752ef2a7734786180a3a925ae68388b097eb022034b8fddbc0057778bd76be9a2e9988dbdbc08497956a81b0fe88b6dee22a066a012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016beffffffffaa41829957fe65a3ba17e9765f61d16eceece4055643add5e0fc810025c6fe41000000006a4730440220788ebf951e8481db3811968106bc4e166bbda52e7e705f116d07fae17691111002204396f3527ebb304c401d1ec3cf6139c88b6f105bed4800e200f88894e3f308df012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016beffffffffc1d6fffd798f7d6972d0f89bb29e9ac6981c116eb3dda800b83175b726416c33000000006a47304402206c966fa7dee354bd83ecc2c3ac32a892164fe95b978d7fd0bb3ce9a3a3d241e70220661fc19fabde9c61752801ff6c29801b583e63f8829740c79f78b35456b638ed012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016beffffffff0af7f73774918b22035c45d60498d661344159cffd32a08fb720e43afd7bcd03000000006a47304402200a004de8c3227339fc11162d0cb076f7287a85a1ca0921efb20e5a5e68ccb48d0220714e71952c1af4c8eb77dbcbccbbb8e0ce3727fc66ca247b5b6b31c11f971932012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016beffffffffaa01c921ae9c0e66e8f7edd1430caab09eeebc31bf933aa8fa2460d6731cfafc000000006a47304402207368a442078d38952528774041247f382cda5f08e79911d3d3be6f5ab28cf33e02202442213520651a16b92214f9e5051e2a9e541549dc819bdbbcf2b53ef78a7918012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016befffffffff14d3170205347a82b60035bc3c4ef06018e1d68ebdfa126608f4c5af23f952e020000006b4830450221008d08f5601fa644f24e19322636497dc2839a7dad2bd84b2310cfb52894786de3022073225f79cdb0516f3f0b6b6b59157ec8d1a57e123596ea24dcaa6807c5e9202001210320e8cee427771928544054986e9dc14f2a9d0bb7aea0ffcdb382023475b5bdbcffffffff0300000000000000001976a914658351902a6bf8f6a60fc274e237af4edbcad49488accf00000002000000046e6f7661046e6f7661010000000a53555045522e4e4f56410a0000000000000000000000046e6f7661227447424d634c7236647766614d616f59694a67745a336359556262477362706238741453757065726e6f766120697320636f6d6d696e6700000000000000001976a914658351902a6bf8f6a60fc274e237af4edbcad49488accf00000005000000046e6f7661046e6f7661055355504552046e6f7661227447424d634c7236647766614d616f59694a67745a33635955626247736270623874020000000024870308000000001976a9145ba47d86fc48e1bca6720b082f4a4c0f8590ccb288ac010000000000000000000000");
    });
});
