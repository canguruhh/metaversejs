var chai = require("chai"),
    expect = chai.expect,
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    networks = require('../src/networks'),
    Metaverse = require('../');

chai.use(chaiAsPromised);

describe('Multisignature', function () {

    describe('Script operations', () => {

        it('Multisignature redeem script extraction', () => {
            expect(Metaverse.script.extractP2SHRedeem('OP_0 [ 304402206da37c516fa41bdbfcb2f080f64439eb2d0ee33ceaa322427c12b0df31d4c2e50220712cf84e9d095c73d3a3bcd420a2f67a521809870f586fdfd2c509ecf51e36fc01 ] [ 3045022100c25e8f99cb63498857861b9e2b402858918ae38c76dae190b9256925aea653c802203ccf373a88c21004fc7d1f3bb58595cf3021eb439f13df2a0b854ecbeebd8b9901 ] [ 5221035451cebcc2a7fd1058c90ab6df818f083d72362682350b80827037ab3aec70e321036f5cd17f3c6ed0968d248366e90c03ffb8ceb1c86df2c91d1ec7ee78f7e5b18d21037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c53ae ]')).to.equal("5221035451cebcc2a7fd1058c90ab6df818f083d72362682350b80827037ab3aec70e321036f5cd17f3c6ed0968d248366e90c03ffb8ceb1c86df2c91d1ec7ee78f7e5b18d21037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c53ae");
        });
        it('Multisignature signature extraction', () => {
            expect(Metaverse.script.extractP2SHSignatures('OP_0 [ 304402206da37c516fa41bdbfcb2f080f64439eb2d0ee33ceaa322427c12b0df31d4c2e50220712cf84e9d095c73d3a3bcd420a2f67a521809870f586fdfd2c509ecf51e36fc01 ] [ 3045022100c25e8f99cb63498857861b9e2b402858918ae38c76dae190b9256925aea653c802203ccf373a88c21004fc7d1f3bb58595cf3021eb439f13df2a0b854ecbeebd8b9901 ] [ 5221035451cebcc2a7fd1058c90ab6df818f083d72362682350b80827037ab3aec70e321036f5cd17f3c6ed0968d248366e90c03ffb8ceb1c86df2c91d1ec7ee78f7e5b18d21037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c53ae ]')).to.deep.equal(["304402206da37c516fa41bdbfcb2f080f64439eb2d0ee33ceaa322427c12b0df31d4c2e50220712cf84e9d095c73d3a3bcd420a2f67a521809870f586fdfd2c509ecf51e36fc01", "3045022100c25e8f99cb63498857861b9e2b402858918ae38c76dae190b9256925aea653c802203ccf373a88c21004fc7d1f3bb58595cf3021eb439f13df2a0b854ecbeebd8b9901"]);
            expect(Metaverse.script.extractP2SHSignatures('OP_0 [ 5221035451cebcc2a7fd1058c90ab6df818f083d72362682350b80827037ab3aec70e321036f5cd17f3c6ed0968d248366e90c03ffb8ceb1c86df2c91d1ec7ee78f7e5b18d21037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c53ae ]')).to.deep.equal([]);
            expect(Metaverse.script.extractP2SHSignatures('')).to.deep.equal([]);
        });
        it('Multisignature script check', () => {
            expect(Metaverse.script.isP2SH('3abc')).to.equal(false);
            expect(Metaverse.script.isP2SH('dup hash160 [ 20317353b6e296cd9d1545134f2d5afdee00f7ae ] equalverify checksig')).to.equal(false);
            expect(Metaverse.script.isP2SH('hash160 [ fb142c5346a3a8091ad9fb70918a81b55b1ef774 ] equal')).to.equal(true);
        });
        it('Multisignature address check', () => {
            expect(Metaverse.multisig.isMultisigAddress('3abc')).to.equal(false);
            expect(Metaverse.multisig.isMultisigAddress('3abcde12345')).to.equal(false);
            expect(Metaverse.multisig.isMultisigAddress('MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB')).to.equal(false);
            expect(Metaverse.multisig.isMultisigAddress('3KXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB')).to.equal(true);
            expect(Metaverse.multisig.isMultisigAddress('3KXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB3434')).to.equal(false);
        });
    })

    describe('Wallet generation', () => {
        it('Generate 2/3 multisignature wallet', () => {
            let multisig = Metaverse.multisig.generate(2, ['035451cebcc2a7fd1058c90ab6df818f083d72362682350b80827037ab3aec70e3', '036f5cd17f3c6ed0968d248366e90c03ffb8ceb1c86df2c91d1ec7ee78f7e5b18d', '037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c']);
            return Promise.resolve(multisig.address)
                .should.become("3HvBi1ecp1yep6geL91pPDHgREFnNcSJTh");
        });
        it('Generate 4/4 multisignature wallet', () => {
            let multisig = Metaverse.multisig.generate(4, ['02b9afe4139cca542f2c554fb4d304935b68894297495da45c426dcea3cd615fb3', '036f5cd17f3c6ed0968d248366e90c03ffb8ceb1c86df2c91d1ec7ee78f7e5b18d', '03731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9', '037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c']);
            return Promise.resolve(multisig.address)
                .should.become("3Pz8MznF5ynzNKntQSbLEuTVYC17Pbwsmy");
        });
        it('Generate 1/2 multisignature wallet', () => {
            let multisig = Metaverse.multisig.generate(1, ['03731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9', '037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c']);
            return Promise.resolve(multisig.address)
                .should.become("36ogHBUc4d3SZBAtXWX2xYg7dRYLR3K8DY");
        });
    })

    describe('Spend from multisig', function () {
        //Generate the wallet
        var wallet;
        beforeEach(() => Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero", "testnet")
            .then((w) => {
                wallet = w;
                return wallet;
            })
        );

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
        it('Send ETP from multisig address', () => {
            var tx = new Metaverse.transaction();
            let multisig = {
                k: ['03731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9', '037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c', '02b9afe4139cca542f2c554fb4d304935b68894297495da45c426dcea3cd615fb3'],
                m: 2,
                n: 3,
                s: '03731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9',
                a: "3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX"
            };
            multisig.r = Metaverse.multisig.generate(multisig.m, multisig.k).script;
            tx.addInput("3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX", "84b8af0263e898d192d626e5d2e44c304917cfacfe92d0afc656fea5049f4730", 0, 'hash160 [ fb142c5346a3a8091ad9fb70918a81b55b1ef774 ] equal');
            tx.addOutput("tBXgTKxu1PGGUMQLaA492aYzdQ3tJJEv5t", "ETP", 1000);
            tx.addOutput("3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX", "ETP", 89000);
            return wallet.signMultisig(tx, multisig)
                .then((stx) => stx.encode())
                .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
                .should.become("040000000130479f04a5fe56c6afd092feaccf1749304ce4d2e526d692d198e86302afb88400000000b500483045022100fd76a3b17eef4cec6553a0790e509fdf571ff7db84c5edc0ecab262786f26b44022057c7d95033bd03458297c19c885aeafe34eb1c35e13d84152f41753d68507433014c69522102b9afe4139cca542f2c554fb4d304935b68894297495da45c426dcea3cd615fb32103731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca921037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c53aeffffffff02e8030000000000001976a9143282bd54b4a4b8cd577926fff45954ff0e00253588ac0100000000000000a85b01000000000017a914fb142c5346a3a8091ad9fb70918a81b55b1ef77487010000000000000000000000");
        });
        it('Send ETP from multisig address last signature', () => {
            var tx = new Metaverse.transaction();
            let multisig = {
                k: ['03731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9', '037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c', '02b9afe4139cca542f2c554fb4d304935b68894297495da45c426dcea3cd615fb3'],
                m: 2,
                n: 3,
                s: '03731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9',
                a: "3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX"
            };
            multisig.r = Metaverse.multisig.generate(multisig.m, multisig.k).script;
            tx.addInput("3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX", "84b8af0263e898d192d626e5d2e44c304917cfacfe92d0afc656fea5049f4730", 0, 'hash160 [ fb142c5346a3a8091ad9fb70918a81b55b1ef774 ] equal');
            tx.inputs[0].script = "OP_0 [ 3045022100fe9811c0dd1e9a548d3b28418c4e4386c438bf9b418321574ac95ec208aff9e6022046a5d9c279b529a6bd1da9b30a17e2b9d71700e686394ca4001d1acebbd987b401 ] [ 522102b9afe4139cca542f2c554fb4d304935b68894297495da45c426dcea3cd615fb32103731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca921037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c53ae ]";
            tx.addOutput("tFhuyTYeNAttzvEN8FUM5h52GGAujkrKbs", "ETP", 10000);
            tx.addOutput("3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX", "ETP", 80000);
            return wallet.signMultisig(tx, multisig)
                .then((stx) => stx.encode())
                .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
                // .should.become("");
                .should.become("040000000130479f04a5fe56c6afd092feaccf1749304ce4d2e526d692d198e86302afb88400000000fdfd000047304402203ef7bc27cd1dea8bb43665ec1d3cd0ce2e907312afb4a4e49c1032148a6fb1a20220317124ceb92f38c8258f32187e82f2c26528c5b76735350760698dcd35dee4bf01483045022100fe9811c0dd1e9a548d3b28418c4e4386c438bf9b418321574ac95ec208aff9e6022046a5d9c279b529a6bd1da9b30a17e2b9d71700e686394ca4001d1acebbd987b4014c69522102b9afe4139cca542f2c554fb4d304935b68894297495da45c426dcea3cd615fb32103731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca921037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c53aeffffffff0210270000000000001976a9146052b015d31cfeb403fe50128e440bde5d2650ec88ac0100000000000000803801000000000017a914fb142c5346a3a8091ad9fb70918a81b55b1ef77487010000000000000000000000");
        });

        it('Send ETP from multisig m=1 address', () => {
            var tx = new Metaverse.transaction();
            var multisig = {
                k: ['03731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9', '037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c'],
                m: 1,
                n: 2,
                s: '03731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9',
                a: "36ogHBUc4d3SZBAtXWX2xYg7dRYLR3K8DY"
            };
            multisig.r = Metaverse.multisig.generate(multisig.m, multisig.k).script;
            tx.addInput("36ogHBUc4d3SZBAtXWX2xYg7dRYLR3K8DY", "386e14a1083018bfb5d712c6caeec319e464c19e5c5d2f9d81386388a314019a", 0, 'hash160 [ 381b247c07294ea4f7c7d162a71bacf630a031eb ] equal');
            tx.addOutput("tBXgTKxu1PGGUMQLaA492aYzdQ3tJJEv5t", "ETP", 100000000);
            tx.addOutput("36ogHBUc4d3SZBAtXWX2xYg7dRYLR3K8DY", "ETP", 899990000);
            return wallet.signMultisig(tx, multisig)
                .then((stx) => stx.encode())
                .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
                .should.become("04000000019a0114a3886338819d2f5d5c9ec164e419c3eecac612d7b5bf183008a1146e38000000009100473044022019e210f46cffa34facbbb31fc668f4aafb1edf60927e6cf8aee14d5cab2099c90220080e1dee4f9be19723fba26133f3a574a3e505d4efa085bf40f4a8afd48f05a90147512103731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca921037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c52aeffffffff0200e1f505000000001976a9143282bd54b4a4b8cd577926fff45954ff0e00253588ac0100000000000000f0c1a4350000000017a914381b247c07294ea4f7c7d162a71bacf630a031eb87010000000000000000000000");
        });


    })

    describe('Signature operations', () => {
        //Generate the wallet
        var wallet;
        beforeEach(() => Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero", "testnet")
            .then((w) => {
                wallet = w;
                return wallet;
            })
        );

        it('Add multisig signature to raw tx', () => {
            var tx = Metaverse.transaction.decode("04000000016bc26bfa09fe26e99e600a0c465c2401c325fb8e55ef43f895089353f5594a6d00000000b500483045022100ddd228ab2b6b37b9bbc928bcad921ef557de588351d241389c42004d81e9ff04022016cf017373b7f9bdca69b31f055478a1bde65826ba12f3d66f5ae29025c81923014c69522102b9afe4139cca542f2c554fb4d304935b68894297495da45c426dcea3cd615fb32103731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca921037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c53aeffffffff0200e1f505000000001976a9143282bd54b4a4b8cd577926fff45954ff0e00253588ac0100000000000000f0e90f240100000017a914fb142c5346a3a8091ad9fb70918a81b55b1ef77487010000000000000000000000");
            let multisig = {
                k: ["02b9afe4139cca542f2c554fb4d304935b68894297495da45c426dcea3cd615fb3", "03731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9", "037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c"],
                m: 2,
                n: 3,
                s: '03731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca9',
                a: "3QabhM8fsQMxTQerGKfiuteZNCfsSKxPRX"
            };
            multisig.r = Metaverse.multisig.generate(multisig.m, multisig.k).script;
            tx.inputs[0].previous_output.script = "hash160 [ fb142c5346a3a8091ad9fb70918a81b55b1ef774 ] equal";
            return wallet.signMultisig(tx, multisig)
                .then((stx) => stx.encode())
                .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
                .should.become("04000000016bc26bfa09fe26e99e600a0c465c2401c325fb8e55ef43f895089353f5594a6d00000000fdfe0000483045022100daa6d6dd4c32c8cfb7c8062242c74422926bb3c9bb60d525fe801e9c58b0e2d60220075548b8b8f35a71005acd9e52646e90aa5c080f5eb3eeac3922a84c3eb13c9a01483045022100ddd228ab2b6b37b9bbc928bcad921ef557de588351d241389c42004d81e9ff04022016cf017373b7f9bdca69b31f055478a1bde65826ba12f3d66f5ae29025c81923014c69522102b9afe4139cca542f2c554fb4d304935b68894297495da45c426dcea3cd615fb32103731c8999b75e35ecfcc5acad89ef45621a7145c31890c1493a29a36c73822ca921037bfb27945a6e40e3621f2559f8a8fc3c4317f5d48dc61ec02fcbd7e8a52c079c53aeffffffff0200e1f505000000001976a9143282bd54b4a4b8cd577926fff45954ff0e00253588ac0100000000000000f0e90f240100000017a914fb142c5346a3a8091ad9fb70918a81b55b1ef77487010000000000000000000000");
        });
        it('Check signature status', () => {
            var transaction = Metaverse.transaction.decode('040000000397536504a5beab3bf93a4e01bf9d250669fdd583a04ad364e1244544db650a9d00000000fdfd000048304502210084c1f0a6320981206b3ad0523fe079d59573a4805b680472be00909b4ea81cf502206fc1063a341a11e1da67fa8fc00e3803b1acb81f1eaffa63757fe07ff3767dc6014730440220217223ef0ea7e875ae787c826a5470d2c6a3969f950b4781a733d32d7bba8bc102203bd362295aeae618902ba71f68ee3aba0c7cac14229b5bac69184880f650feab014c6952210210211cb5e9cacbe0ac540f9b09187f75103b01239d7f6dfc88ee55b910441dee2103228f47ae0f73292ce215cd0bbdb8f8075d9a3c0ee5f88eee8550868dc888856c21036033236e59dd1a16ae41cc233b4239128b2023731c7ddc5da4136234212c616f53aeffffffff5bb8710d783959600b2d3b48b3a03d5e5d3e47f2f6db90bd1da76ed04f03f5cf01000000fdfd0000483045022100941894af18551c49a19ff69054daa7b5be9e3589e5268f4d97e3405f9fb3133402203171f0a9b05c73863928097b718cfe5ed7689e25804a1ba2689191388729b63101473044022035b0462cc0de5fb1d41cd5f292501c816b996610669d5eed2b0a8e5ce803c6b602207e5214a06b1618e0d3aaabc005a90d2ada3c6f032d146f78cf998350579fac1e014c6952210210211cb5e9cacbe0ac540f9b09187f75103b01239d7f6dfc88ee55b910441dee2103228f47ae0f73292ce215cd0bbdb8f8075d9a3c0ee5f88eee8550868dc888856c21036033236e59dd1a16ae41cc233b4239128b2023731c7ddc5da4136234212c616f53aeffffffff66aa7183bfe89ecbe10dc51514a6aaa08ed4663a146a7e4bb8af4203ec753f6601000000fdfd0000473044022064ad529e1f9deb51cfea92448af118bc936df900ca125203a32f9eed1d6816b002205aec4b67226e15e2450e394b963393854a69c2c77e99a28f3118064de28938bd01483045022100dc959b714471edbe7bd5887a9ec3bdeac4bb4b95e33f55ccf9d7c06555de2f410220481a3cbde003b10b85b8bbf69c9349b799c06854d5412144067c473997216c3c014c6952210210211cb5e9cacbe0ac540f9b09187f75103b01239d7f6dfc88ee55b910441dee2103228f47ae0f73292ce215cd0bbdb8f8075d9a3c0ee5f88eee8550868dc888856c21036033236e59dd1a16ae41cc233b4239128b2023731c7ddc5da4136234212c616f53aeffffffff02c02f168d5d0000001976a9141581e0b3951e560d32d67c030f8fce8856202e5488ac010000000000000036f431d2ba00000017a9141406b6c5e35c62b425c627369edcc615c5089ccc87010000000000000000000000');
            transaction.inputs[0].previous_output.script = "hash160 [ 1406b6c5e35c62b425c627369edcc615c5089ccc ] equal";

            var redeem = '52210210211cb5e9cacbe0ac540f9b09187f75103b01239d7f6dfc88ee55b910441dee2103228f47ae0f73292ce215cd0bbdb8f8075d9a3c0ee5f88eee8550868dc888856c21036033236e59dd1a16ae41cc233b4239128b2023731c7ddc5da4136234212c616f53ae'
            var status = Metaverse.multisig.getSignatureStatus(transaction, 0, redeem, Metaverse.networks.mainnet, '036033236e59dd1a16ae41cc233b4239128b2023731c7ddc5da4136234212c616f');

            expect(status.targetSigned, 'Target signature status').to.equal(true);
            expect(status.complete, 'Signature completion status').to.equal(true);
            expect(status.signatureMap, 'Signature map order').to.deep.equal([0, -1, 1]);
        });
    });

});
