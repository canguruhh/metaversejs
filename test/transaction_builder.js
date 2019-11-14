var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    Metaverse = require('../');

chai.use(chaiAsPromised);

describe('Transaction builder', function () {

    //Generate the wallet
    var wallet;
    var wallet2;

    beforeEach(() => Metaverse.wallet.fromMnemonic("butter vacuum breeze glow virtual mutual veteran argue want pipe elite blast judge write sand toilet file joy exotic reflect truck topic receive wait", 'testnet')
        .then((w) => {
            wallet = w;
        })
    );

    beforeEach(() => Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero", 'testnet')
        .then((w) => {
            wallet2 = w;
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
                attachment: {
                    type: 'asset-cert',
                    cert: 'domain',
                    symbol: "SUPER",
                    to_did: 'nova',
                    from_did: 'nova',
                    owner: 'nova'
                },
                index: 2,
                value: 0
            },
        ];
        return Metaverse.transaction_builder.issueAsset(inputs, "tGBMcLr6dwfaMaoYiJgtZ3cYUbbGsbpb8t", "SUPER.NOVA", 10, 0, "nova", "Supernova is comming", 0, false, "tFHAbEiLQi3Tdw94Xf9Y5Xkj39CrCMXZFz", { "ETP": -134448932 })
            .then(tx => wallet.sign(tx))
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0400000007c650644df8507a0a15eeea7306550f5370aaa3480b954b8464be9ddd38bfc6f9000000006a4730440220395e0013fb9d5c0c97e02d716c7cd66a6a8791455aef0b4cd4ccbfb3ee4bfbe8022078c7b895d0daa904bc5ba9e622f2ce984f457189ac573d48e5bf93348f8c06ee012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016beffffffff3172b74b852b470ac73b76d5504e9b9e8bc7278b364d2564e15d2b86acf451d5000000006a4730440220509f6bdadcc55db84c1272eea4b4752ef2a7734786180a3a925ae68388b097eb022034b8fddbc0057778bd76be9a2e9988dbdbc08497956a81b0fe88b6dee22a066a012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016beffffffffaa41829957fe65a3ba17e9765f61d16eceece4055643add5e0fc810025c6fe41000000006a4730440220788ebf951e8481db3811968106bc4e166bbda52e7e705f116d07fae17691111002204396f3527ebb304c401d1ec3cf6139c88b6f105bed4800e200f88894e3f308df012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016beffffffffc1d6fffd798f7d6972d0f89bb29e9ac6981c116eb3dda800b83175b726416c33000000006a47304402206c966fa7dee354bd83ecc2c3ac32a892164fe95b978d7fd0bb3ce9a3a3d241e70220661fc19fabde9c61752801ff6c29801b583e63f8829740c79f78b35456b638ed012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016beffffffff0af7f73774918b22035c45d60498d661344159cffd32a08fb720e43afd7bcd03000000006a47304402200a004de8c3227339fc11162d0cb076f7287a85a1ca0921efb20e5a5e68ccb48d0220714e71952c1af4c8eb77dbcbccbbb8e0ce3727fc66ca247b5b6b31c11f971932012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016beffffffffaa01c921ae9c0e66e8f7edd1430caab09eeebc31bf933aa8fa2460d6731cfafc000000006a47304402207368a442078d38952528774041247f382cda5f08e79911d3d3be6f5ab28cf33e02202442213520651a16b92214f9e5051e2a9e541549dc819bdbbcf2b53ef78a7918012103225fd175c58ceb6c9ad70679f18eb17c268d0a600edc733435aa40b8010016befffffffff14d3170205347a82b60035bc3c4ef06018e1d68ebdfa126608f4c5af23f952e020000006b4830450221008d08f5601fa644f24e19322636497dc2839a7dad2bd84b2310cfb52894786de3022073225f79cdb0516f3f0b6b6b59157ec8d1a57e123596ea24dcaa6807c5e9202001210320e8cee427771928544054986e9dc14f2a9d0bb7aea0ffcdb382023475b5bdbcffffffff0300000000000000001976a914658351902a6bf8f6a60fc274e237af4edbcad49488accf00000002000000046e6f7661046e6f7661010000000a53555045522e4e4f56410a0000000000000000000000046e6f7661227447424d634c7236647766614d616f59694a67745a336359556262477362706238741453757065726e6f766120697320636f6d6d696e6700000000000000001976a914658351902a6bf8f6a60fc274e237af4edbcad49488accf00000005000000046e6f7661046e6f7661055355504552046e6f7661227447424d634c7236647766614d616f59694a67745a33635955626247736270623874020000000024870308000000001976a9145ba47d86fc48e1bca6720b082f4a4c0f8590ccb288ac010000000000000000000000");
    });

    it('Send MST with attenuation model', () => {
        var inputs = [
            {
                address: "t9rpuoySrPJH46GkpdUtJMCyvfuR9XKa8N",
                hash: "43f2d6cd5d019298600f6c88ad14bdf2a9a7e15eac66e2b0f966b9d3ea06a2d2",
                script: "[ 32 ] numequalverify dup hash160 [ 20317353b6e296cd9d1545134f2d5afdee00f7ae ] equalverify checksig",
                index: 0,
                value: 21617361438
            },
            {
                address: "tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ",
                hash: "71ef38dbcc8673b6161ed2b832fbc716801d9e5efcaf78f631aa35426823e9fb",
                index: 4,
                attachment: {
                    type: 'asset-transfer',
                    quantity: 9999999999,
                    symbol: "MVS.TEST",
                    decimals: 0
                },
                value: 0
            },
        ];
        return Metaverse.transaction_builder.sendLockedAsset(inputs, "tU2j3z4LjUtFJuSdQdwDqpzSNhj4ssBU1N", undefined, "MVS.TEST", 10, 'PN=0;LH=10000;TYPE=1;LQ=10;LP=10000;UN=1', "t9rpuoySrPJH46GkpdUtJMCyvfuR9XKa8N", { ETP: -21617351438, 'MVS.TEST':  -9999999989})
        .then(tx => {
            tx.outputs[2].address = 'tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ'
            return tx
        })
            .then(tx => wallet2.sign(tx))
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0400000002d2a206ead3b966f9b0e266ac5ee1a7a9f2bd14ad886c0f609892015dcdd6f243000000006c473044022002280be7b727556aad62e7ceefb60c887c704c378aff72d4cb716304020d04ae02204670a464ae5d0e541f42310f4502d6abb653b1272b5beedc79364f47404ca8ac012103731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca90132fffffffffbe923684235aa31f678affc5e9e1d8016c7fb32b8d21e16b67386ccdb38ef71040000006a47304402201e78b57e625c16d87ad2be7bb4382078720db0c5ef0bca42fffe318352a0267502204fa66758fb2d29de825b654bff4b6a7278b893066bdc861720d96a98dfeb374901210358068a43bb405201db2a19fd488431a34ed0949891b206a30d1d5d120ba90445ffffffff0300000000000000006a4d2800504e3d303b4c483d31303030303b545950453d313b4c513d31303b4c503d31303030303b554e3d31240000000000000000000000000000000000000000000000000000000000000000ffffffffb276a914e782fbba93466771c63d7a9fcc54d85efa26fd3488ac010000000200000002000000084d56532e544553540a000000000000000e9b7e08050000001976a91420317353b6e296cd9d1545134f2d5afdee00f7ae88ac010000000000000000000000000000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac010000000200000002000000084d56532e54455354f5e30b540200000000000000");
    });

    it('Burn ETP', () => {
        var inputs = [
            {
                address: "tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ",
                hash: "4ccc4c55ff6c41b96135b1b899ae4deeaef5f7826109c4854872d42192133e14",
                script: "dup hash160 [ 3e995f80739ecbfad8d92e3e523c540bd2847ffd ] equalverify checksig",
                index: 1,
                value: 99990000
            },
        ];
        return Metaverse.transaction_builder.burn(inputs, {ETP: 1}, undefined, 'tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ', {ETP: -99979999})
            .then(tx => wallet2.sign(tx))
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become('0400000001143e139221d4724885c4096182f7f5aeee4dae99b8b13561b9416cff554ccc4c010000006a473044022031ffc44735f51b75945b8bbca09d8d7f4be78f9263e8e98ecfea19b32b4ce3fe0220127208a6d6f510e0d3797b961597992f977ee09c97a27450a55df131676cd33601210358068a43bb405201db2a19fd488431a34ed0949891b206a30d1d5d120ba90445ffffffff020100000000000000016a0100000000000000df92f505000000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac010000000000000000000000');
    });

    it('Burn MST', () => {
        var inputs = [
            {
                address: "tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ",
                hash: "89295f40603487cd3f69c464e9a17414ee0c8d00b7292217663f425d5b57dcc1",
                script: "dup hash160 [ 3e995f80739ecbfad8d92e3e523c540bd2847ffd ] equalverify checksig",
                index: 0,
                value: 0,
                attachment: {
                    type: 'asset-transfer',
                    quantity: 10000000000,
                    symbol: "AAAA",
                    decimals: 4,
                },
            },
            {
                address: "tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ",
                hash: "ac52a47443fac0425a1af28325d23a40bd884f88e1b13f7fa4f17482ecfbfc97",
                script: "dup hash160 [ 3e995f80739ecbfad8d92e3e523c540bd2847ffd ] equalverify checksig",
                index: 0,
                value: 100000000
            }
        ];
        return Metaverse.transaction_builder.burn(inputs, {AAAA: 1}, 'BLACKHOLE', 'tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ', {ETP: -99990000, AAAA: -9999999999})
            .then(tx => wallet2.sign(tx))
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become('0400000002c1dc575b5d423f66172229b7008d0cee1474a1e964c4693fcd873460405f2989000000006a47304402206a985ce6f58a89089fd8900e76ceb08f2134fc219af5f70030f1db71366d432602203b1d418492afb2eb418a7e03ae6c2507526202f31dddbe281381145058f2a2a901210358068a43bb405201db2a19fd488431a34ed0949891b206a30d1d5d120ba90445ffffffff97fcfbec8274f1a47f3fb1e1884f88bd403ad22583f21a5a42c0fa4374a452ac000000006a47304402202d4b281d1c6e3d78cf4b6c48bb2df39ea46f428012a521c4c7828447d6e95a4e02202c2099238deccb1475c9e3ae65c5a8329e7171c9d5a4c847d11aabfd6469f7cb01210358068a43bb405201db2a19fd488431a34ed0949891b206a30d1d5d120ba90445ffffffff030000000000000000016acf0000000200000009424c41434b484f4c45000200000004414141410100000000000000f0b9f505000000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac010000000000000000000000000000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac0100000002000000020000000441414141ffe30b540200000000000000');
    }); 
});
