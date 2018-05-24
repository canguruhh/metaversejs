var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    networks = require('../src/networks'),
    Metaverse = require('../');

chai.use(chaiAsPromised);

describe('ETP deposit', function() {

    //Generate the wallet
    var wallet;
    beforeEach(() => Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero")
        .then((w) => {
            wallet = w;
            return wallet;
        })
    );

    it('One week deposit', () => {
        var tx = new Metaverse.transaction();
        tx.version=2;
        tx.addInput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB", "6ddfdefd52644c392288d8adf6e34ed3fb3eb7c48ad43260e89a35875d82507c", 0);
        tx.addInput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf", "6ddfdefd52644c392288d8adf6e34ed3fb3eb7c48ad43260e89a35875d82507c", 1);
        tx.addLockOutput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB", 10000000, 25200);
        tx.addOutput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB", "ETP", 3970000);
        return wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("02000000027c50825d87359ae86032d48ac4b73efbd34ee3f6add88822394c6452fddedf6d000000006a473044022032b361b11d36c617f86329b6abfdf57087cbb4c0f48477afa35e663e15caee95022064ef936f596e52660a6aad8b554e95a3c65d8a261f71dad5b6904a7f38a85f800121034593f54b073ed6a3728056d0f6595d614c717c639a9301761de7c8ef5d5fe1b4ffffffff7c50825d87359ae86032d48ac4b73efbd34ee3f6add88822394c6452fddedf6d010000006b483045022100dcb2db445babb14a7e5d896a916931000c9328cef6c5a0ea82d8474ec080ddd902201a17ce4f93b9372cca188daa470c293ac93c798202b1b32cea8a920da3ffd2400121035550f8c20e914c4989dcd3521dccd4def479ff8d8e147ecf366cbd196e658712ffffffff0280969800000000001d0270629d76a9147f8ac2a0179a4eb308c7ae837aed878b5ed25de288ac0100000000000000d0933c00000000001976a9147f8ac2a0179a4eb308c7ae837aed878b5ed25de288ac010000000000000000000000");
    });

    it('One year deposit', () => {
        var tx = new Metaverse.transaction();
        tx.version=2;
        tx.addInput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB", "6ddfdefd52644c392288d8adf6e34ed3fb3eb7c48ad43260e89a35875d82507c", 0);
        tx.addInput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf", "6ddfdefd52644c392288d8adf6e34ed3fb3eb7c48ad43260e89a35875d82507c", 1);
        tx.addLockOutput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB", 10000000, 1314000);
        tx.addOutput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB", "ETP", 3970000);
        return wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => {
                signed_tx = signed_raw_tx.toString('hex');
                return signed_tx;
            }).should.become("02000000027c50825d87359ae86032d48ac4b73efbd34ee3f6add88822394c6452fddedf6d000000006b483045022100d41fe0e43188d42d59949eac54169ca4d5926393112932f933b6ffa3c0c18c320220710642b86ea1a8aff18ede1cef1d84f3c7c88205d2fb24cb386d132cb0c057580121034593f54b073ed6a3728056d0f6595d614c717c639a9301761de7c8ef5d5fe1b4ffffffff7c50825d87359ae86032d48ac4b73efbd34ee3f6add88822394c6452fddedf6d010000006a47304402207e16a728eaf2ea7a72ae61032e1619e9903579afa8ae957931903c0df0912c99022031238229300d63294cb110bdb92fcee21dd066597653b42cd526ce4b1a7747670121035550f8c20e914c4989dcd3521dccd4def479ff8d8e147ecf366cbd196e658712ffffffff0280969800000000001e03d00c149d76a9147f8ac2a0179a4eb308c7ae837aed878b5ed25de288ac0100000000000000d0933c00000000001976a9147f8ac2a0179a4eb308c7ae837aed878b5ed25de288ac010000000000000000000000");
    });
});
