var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    Metaverse = require('../');

chai.use(chaiAsPromised);

describe('Issue Asset', function () {

    //Generate the wallet
    var mining_wallet;
    beforeEach(async () => {
        mining_wallet = await Metaverse.wallet.fromMnemonic("butter vacuum breeze glow virtual mutual veteran argue want pipe elite blast judge write sand toilet file joy exotic reflect truck topic receive wait", 'testnet')
    });

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
        tx.version = 2;
        tx.addInput("tFKkLFZ5B29CkMLkYcAd85JxZ8v2joXFDJ", "01a37d6434dbc7b8bc61665ad5498096a57150a14118a786cccf1ac165a5c6ab", 0);
        tx.addInput("tGXb55CFL4auEVVTA27J16n2AXhRhfDBJh", "4bbac9a0653bd42cd8540f1f663c0751e38917dc2beb3c7054ee5e5c50928e85", 0);
        tx.addAssetIssueOutput("SUN.SHINE", 1000000000, 4, "coinmaster", "tBcdLMaqR1D3mhyBL7CEWwLPR8yRnPkHBd", "Let it shine", 0);
        tx.addOutput("tFKkLFZ5B29CkMLkYcAd85JxZ8v2joXFDJ", "ETP", 22699990000);
        return sunshine_wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0200000002abc6a565c11acfcc86a71841a15071a5968049d55a6661bcb8c7db34647da301000000006b483045022100ebb3b8d7bf447759dc147c9b9fad31581a1ffad60b51815499c8efbbfefdfd3f02204e2f37214c1949cf8a07c998fde65fb6dc6e61a058bf4f60a804f0f627ec9b3d012103ab680cf98ebcdb09e2b75f053c0aa3342794ecbf651ba7920fba68881a363648ffffffff858e92505c5eee54703ceb2bdc1789e351073c661f0f54d82cd43b65a0c9ba4b000000006b4830450221008246630baf90e1d4b46d555699b065caffce44293730e8da5e13b090546c33fd02200aee090d9f87aac3bc546a367f71e612de591748b559eea36476fb9da41477930121034fefae9e40ccf10d6647700bbcfe786423c250d224378c52b638d5974ba08fd2ffffffff0200000000000000001976a914337236fac71eac309678acf6941ab6c415e36ad888ac0100000002000000010000000953554e2e5348494e4500ca9a3b00000000040000000a636f696e6d617374657222744263644c4d6171523144336d6879424c37434557774c50523879526e506b4842640c4c6574206974207368696e65f05b0649050000001976a9145c217d05090c6784c9bfdd78692e64994f20c92488ac010000000000000000000000");
    });

    it('Issue THE.TIMES', () => {
        var tx = new Metaverse.transaction();
        tx.version = 2;
        tx.addInput("tQCK1zZS886mgLpdDJj7Ak3BhRRdgti3KT", "815c234ac4c0fc666db2f51db73be9942776a09b268a18b90828186c033696ec", 0);
        tx.addAssetIssueOutput("THE.TIMES", 1000000000, 4, "satoshi", "tQCK1zZS886mgLpdDJj7Ak3BhRRdgti3KT", "ETP classic coin", 0);
        tx.addOutput("tQCK1zZS886mgLpdDJj7Ak3BhRRdgti3KT", "ETP", 21999990000);
        return wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0200000001ec9636036c182808b9188a269ba0762794e93bb71df5b26d66fcc0c44a235c81000000006b483045022100e9a3cd1b361166557223c3a13cfd3fc0e234e054443eba4ae05094e32cc8359402201410026dfaa9a356aaad4d4d3fce10f936898aa0190dd1823e29d1141d8f1b3801210390b708696f6ddd7a716e41155f783f4189c671370d5a28f1e13b0fa402c49ab9ffffffff0200000000000000001976a914bd7293b2cda8473a97d5c7694c7b17da76e9ddab88ac010000000200000001000000095448452e54494d455300ca9a3b0000000004000000077361746f736869227451434b317a5a533838366d674c7064444a6a37416b334268525264677469334b541045545020636c617373696320636f696ef0344d1f050000001976a914bd7293b2cda8473a97d5c7694c7b17da76e9ddab88ac010000000000000000000000");
    });

    it('Issue MINEABLE2', () => {
        var tx = new Metaverse.transaction();
        tx.version = 4;

        tx.addInput("t82k8SzgW7rwW3SRPKj4KqbXoaixSRo74U", "71ef38dbcc8673b6161ed2b832fbc716801d9e5efcaf78f631aa35426823e9fb", 0);
        tx.addInput("tFqa4CQK527eGi1rAwTpdYLwYFwWL6oHcj", "71ef38dbcc8673b6161ed2b832fbc716801d9e5efcaf78f631aa35426823e9fb", 2);
        tx.addInput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "9d8ab498ae383d45107c426ae3b9ddab8697c1364ae96b846fa0d78eb8719bc2", 1 );
        tx.addInput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "0ae0adced4db97f473597fb39ecb0db39c423eaf85e0f70c844bbc5eabfaf181", 0, "[ 0a ] numequalverify dup hash160 [ 48b6adc8508180d58d2efe4a6068e7934fdf8b30 ] equalverify checksig");
        tx.addInput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "4a16f9d9390aa29baeaa5db9b03cd5e0a22255a59ed178bf4ddd95c154aa9d73", 0, "[ 0a ] numequalverify dup hash160 [ 48b6adc8508180d58d2efe4a6068e7934fdf8b30 ] equalverify checksig");
        tx.addInput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "1d358951e82a4d847fe1ee774b5f2508d4d381bfa1b5e911047977291097326b", 0, "[ 0a ] numequalverify dup hash160 [ 48b6adc8508180d58d2efe4a6068e7934fdf8b30 ] equalverify checksig");
        tx.addInput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "8f8b65a5059f0319af9fda2eb4085ed47926fe73e9b4faf2ec604ef4b8723b01", 0, "[ 0a ] numequalverify dup hash160 [ 48b6adc8508180d58d2efe4a6068e7934fdf8b30 ] equalverify checksig");
        tx.addInput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "94ae8e06f516cda62f788cde242bdab847c9c29067ddb8d05dba773232f45057", 0, "[ 0a ] numequalverify dup hash160 [ 48b6adc8508180d58d2efe4a6068e7934fdf8b30 ] equalverify checksig");
        tx.addInput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "9ec8fe774e9543d1f139802a9a0fdcaf8029f1b022a3be25c1f520e4389819d0", 0, "[ 0a ] numequalverify dup hash160 [ 48b6adc8508180d58d2efe4a6068e7934fdf8b30 ] equalverify checksig");
        tx.addInput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "15e83d9d91f474c9d0a3cf4d4364f3ff7511a6c357fad3edc83ef811a6e5078d", 0, "[ 0a ] numequalverify dup hash160 [ 48b6adc8508180d58d2efe4a6068e7934fdf8b30 ] equalverify checksig");
        tx.addAssetIssueOutput("MINEABLE2", 100000000, 8, "nova", "tGBMcLr6dwfaMaoYiJgtZ3cYUbbGsbpb8t", "test", 0, false, true);
        tx.addCertOutput("MINEABLE2", "nova", "tGBMcLr6dwfaMaoYiJgtZ3cYUbbGsbpb8t", "domain", "autoissue")
        tx.addCertOutput("MINEABLE2", "nova", "tGBMcLr6dwfaMaoYiJgtZ3cYUbbGsbpb8t", "mining", "autoissue", "initial:300000000,interval:500000,base:0.95")
        tx.addOutput("tBELxsiiaMVGQcY2Apf7hmzAaipD4YWTTj", "ETP", 800000000, "yoyo");
        tx.addOutput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "ETP", 485484102);
        return mining_wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("040000000afbe923684235aa31f678affc5e9e1d8016c7fb32b8d21e16b67386ccdb38ef71000000006b4830450221008558ec82d742f55a02fc69c326d3d0ae5f246b1b777fbdc579e8c1ea8138b2f402206569df68732b467f499ebd8277f1e5f44dca68fb16d08a15465e8637673993ff0121032a642a2123bb995dc5caa667ab53baedeecb05f1728adaeade4764ee342d2628fffffffffbe923684235aa31f678affc5e9e1d8016c7fb32b8d21e16b67386ccdb38ef71020000006a473044022040329fb7319559d23ad64469237a23ed7c186f63f91a8e50b4b4747a531dfcc302200805ecf798f12d05b1bf01636b8cf6ddecb2e5d1dcd004514054281e09936e48012103aa69dd177dc40d6071185c921302471d1bc97394591e35a89cce083309597c1effffffffc29b71b88ed7a06f846be94a36c19786abddb9e36a427c10453d38ae98b48a9d010000006b483045022100873e9c4160499e728ba0eb583ce0aa61cad0fd61d5608338c5e7dea9d3130ea302202682ac81c782e975df00edc2b00e129179b7d03f7a48288b12f183ea97d06e46012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8ffffffff81f1faab5ebc4b840cf7e085af3e429cb30dcb9eb37f5973f497dbd4ceade00a000000006d483045022100bb8cb4545501da6034c3ccae8ffe374a5c3da38a8e3c6579ad03722945b8dcd5022026ea02da01aab8633cc8403840f1cdeac9cb686439f5c20a96460b13a68e7fa6012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8010affffffff739daa54c195dd4dbf78d19ea55522a2e0d53cb0b95daaae9ba20a39d9f9164a000000006c47304402205c32ca8dcdcff5521cd05da33a4345b9ae86675dafebe3d6f584bf50c8b3cc6c02203c381d0ce5dd2c224fd78a4593821578ce06e6826f4ff07149acaa763a0b87d9012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8010affffffff6b3297102977790411e9b5a1bf81d3d408255f4b77eee17f844d2ae85189351d000000006c473044022065782d2b7b6e6dd7862fdb38f2954034f671a4c213ec3e202d02f791bff620ba02202db2e274c8d463a9ad258a95346c4b1bb1bf3048a94801e3df17db93435391c0012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8010affffffff013b72b8f44e60ecf2fab4e973fe2679d45e08b42eda9faf19039f05a5658b8f000000006d483045022100cc23535879da3dd9d860cd138b9d5a93b3eb09ac62f0233cf8f40361b2360be202203999d084b5f3cee0d1ab8fa8c5cbf882c016e94c828e8dc5afeeff90eec7b5c7012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8010affffffff5750f4323277ba5dd0b8dd6790c2c947b8da2b24de8c782fa6cd16f5068eae94000000006d483045022100c30d092f156fe524d9ce839739769daa2975459b05840d0ebb97b766ea6cdedc022055ce97b213d794e9c7b9ec4ee38e9c8006c4e7932df2232bea253b5f4ee38c16012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8010affffffffd0199838e420f5c125bea322b0f12980afdc0f9a2a8039f1d143954e77fec89e000000006d483045022100b1dd1490c5cc921c90aa6dad2d3fd86ec6313e3210b7f1a96206c7c4a8662cb3022044502966f3d63597feef97027ac6ad3a6777fbb388f0beaa4604ae5c1591329e012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8010affffffff8d07e5a611f83ec8edd3fa57c3a61175fff364434dcfa3d0c974f4919d3de815000000006d4830450221008232ea1f796fcdd293b934b933d868208eaf849cf1a3096b43fed7017c05c8aa0220314d0eb75c65424ffb0ff245dc97738fed6a176dc93b03c32592031b3c592424012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8010affffffff0500000000000000001976a914658351902a6bf8f6a60fc274e237af4edbcad49488accf00000002000000046e6f76610001000000094d494e4541424c453200e1f5050000000008000000046e6f7661227447424d634c7236647766614d616f59694a67745a33635955626247736270623874047465737400000000000000001976a914658351902a6bf8f6a60fc274e237af4edbcad49488accf00000005000000046e6f766100094d494e4541424c4532046e6f7661227447424d634c7236647766614d616f59694a67745a33635955626247736270623874020000000300000000000000001976a914658351902a6bf8f6a60fc274e237af4edbcad49488accf00000005000000046e6f766100094d494e4541424c4532046e6f7661227447424d634c7236647766614d616f59694a67745a3363595562624773627062387404000060032b696e697469616c3a3330303030303030302c696e74657276616c3a3530303030302c626173653a302e39350008af2f000000001976a9142f3b65f87fa30c7fc1b5e2919daf0aad0e42b07488accf0000000000000004796f796f0046e6ef1c000000001976a91448b6adc8508180d58d2efe4a6068e7934fdf8b3088ac010000000000000000000000");
    });

    it('Issue MINEABLE3', () => {
        var tx = new Metaverse.transaction();
        tx.version = 4;


        tx.addInput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "178f39bfda678bf316e65843ef05e286bc7b5caa8841c6a3286094279556c213", 1);

        tx.addAssetIssueOutput("MINEABLE3", 100000000, 8, "nova2", "t85Hm2nYwQXrry2cVmEHPq8krRdJ7KYjmq", "mineable3 !", 0, false, true);
        tx.addCertOutput("MINEABLE3", "nova2", "t85Hm2nYwQXrry2cVmEHPq8krRdJ7KYjmq", "domain", 'autoissue')
        tx.addCertOutput("MINEABLE3", "nova2", "t85Hm2nYwQXrry2cVmEHPq8krRdJ7KYjmq", "mining", 'autoissue', "initial:300000000,interval:500000,base:0.95")
        tx.addOutput("tBELxsiiaMVGQcY2Apf7hmzAaipD4YWTTj", "ETP", 800000000, "yoyo");
        tx.addOutput("tDZ5YMLJ3z6VbvAsX1c8oe9hJ2nND4jszz", "ETP", 1845474102);
        return mining_wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("040000000113c2569527946028a3c64188aa5c7bbc86e205ef4358e616f38b67dabf398f17010000006b483045022100e90970ee50df0c4add255ffa3bfbeabd8fad72aea61dde7674344c62d48d131902200311e7e2579d4f90b912c7df4ab292d54e01cd4218a2adb7380eb8e2f4c784ef012102ed6134b78ef2a4a38bbf6d1c37878e16a58127ffe777012d93d5fa4ab20b54c8ffffffff0500000000000000001976a9140c9c9a42df0a7036a9e1ddc5a4473c00c2f5816d88accf00000002000000056e6f7661320001000000094d494e4541424c453300e1f5050000000008000000056e6f76613222743835486d326e597751587272793263566d45485071386b7252644a374b596a6d710b6d696e6561626c6533202100000000000000001976a9140c9c9a42df0a7036a9e1ddc5a4473c00c2f5816d88accf00000005000000056e6f76613200094d494e4541424c4533056e6f76613222743835486d326e597751587272793263566d45485071386b7252644a374b596a6d71020000000300000000000000001976a9140c9c9a42df0a7036a9e1ddc5a4473c00c2f5816d88accf00000005000000056e6f76613200094d494e4541424c4533056e6f76613222743835486d326e597751587272793263566d45485071386b7252644a374b596a6d7104000060032b696e697469616c3a3330303030303030302c696e74657276616c3a3530303030302c626173653a302e39350008af2f000000001976a9142f3b65f87fa30c7fc1b5e2919daf0aad0e42b07488accf0000000000000004796f796f0036b3ff6d000000001976a91448b6adc8508180d58d2efe4a6068e7934fdf8b3088ac010000000000000000000000");
    });
});

