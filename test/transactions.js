var assert = require('assert')
var Metaverse = require('../');

describe('Single input ETP transaction', function() {
    var signed_tx, wallet, script;
    beforeEach(function(done) {
        var w = Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero")
            .then((w) => {
                wallet = w;
                var tx = new Metaverse.transaction();
                tx.addInput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB","5554b27dbf657d008511df56e747ffb2173749fd933b03317cee3c1fde271aea",1)
                tx.addOutput("MVpxH8aAa3BAXvbdqUUJwEP6s2ajGKKtyd","ETP",1);
                tx.addOutput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB","ETP",4939995);
                return wallet.sign(tx);
            })
            .then((stx) => {
                script = stx.inputs[0].script;
                return stx.encode()
            })
            .then((signed_raw_tx) => {
                signed_tx = signed_raw_tx.toString('hex');
                done();
            });
    });
    it('signed raw transaction equals test target', () => {
        assert.equal(signed_tx, "0200000001ea1a27de1f3cee7c31033b93fd493717b2ff47e756df1185007d65bf7db25455010000006b483045022100f8fa56d4f3015689c01f4557351e858aec4a139d752bc19b322390093393efc3022077d706621c3e36c8b6a90c6d354e8a85dd81d39a4e2fb582c0fd28f3f1a9caec0121034593f54b073ed6a3728056d0f6595d614c717c639a9301761de7c8ef5d5fe1b4ffffffff0201000000000000001976a914f087200b95bd043a134a0cead903e0a3600d79eb88ac0100000000000000db604b00000000001976a9147f8ac2a0179a4eb308c7ae837aed878b5ed25de288ac010000000000000000000000");
    });
});



describe('Multi input ETP transaction', function() {
    var signed_tx, wallet;
    beforeEach(function(done) {
        var w = Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero")
            .then((w) => {
                wallet = w;
                var tx = new Metaverse.transaction();
                tx.addInput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf","c9c32b0723a57ce087f42df5bb5f98db404a886ef651842f844d59eca6412b27",0);
                tx.addInput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB","707cd4f639e292bd7cbf15c40e9c86d3bbec4c505ca09f6a72eded8313a927be",1);
                tx.addOutput("MVpxH8aAa3BAXvbdqUUJwEP6s2ajGKKtyd","ETP",729995);
                tx.addOutput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf","ETP",619995);
                return wallet.sign(tx);
            })
            .then((stx) => {
                return stx.encode()
            })
            .then((signed_raw_tx) => {
                signed_tx = signed_raw_tx.toString('hex');
                done();
            });
    });
    it('signed raw transaction equals test target', () => {
        assert.equal(signed_tx, "0200000002272b41a6ec594d842f8451f66e884a40db985fbbf52df487e07ca523072bc3c9000000006b483045022100b71e952543ad8d937b9460a0d690132dbc8977f077ced43c4914665698868d5102202547633e9a914b68946db1b6007fad1b35e2c22f6dd014caf45da3860433b4c30121035550f8c20e914c4989dcd3521dccd4def479ff8d8e147ecf366cbd196e658712ffffffffbe27a91383eded726a9fa05c504cecbbd3869c0ec415bf7cbd92e239f6d47c70010000006b483045022100e5067916c7447bca7bb339d1e48ca54e6c84a21c244c9efb05904f71006ad2df02200a72348fb082c42bf707cc2e12288757e0f7cb81fdcdfea0ac21dc2c1e4855910121034593f54b073ed6a3728056d0f6595d614c717c639a9301761de7c8ef5d5fe1b4ffffffff028b230b00000000001976a914f087200b95bd043a134a0cead903e0a3600d79eb88ac0100000000000000db750900000000001976a914e782fbba93466771c63d7a9fcc54d85efa26fd3488ac010000000000000000000000");
    });
});

describe('Asset transaction', function() {
    var signed_tx, wallet;
    beforeEach(function(done) {
        var w = Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero")
            .then((w) => {
                wallet = w;
                var tx = new Metaverse.transaction();
                var builder = new Metaverse.transaction_builder();
                tx.addInput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf","795481c6fca77b699830d3e6c3b38ed9e89a74b4a9ea01a9d0f2c43fab91f9df",1);
                tx.addInput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf","068096506bfb962f8ea661514c0221602dcff20502eb91aa8e57e65db3e1dc3f",0);
                tx.addInput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB","376fb20af80491dc29f8539a85522d9260060c82fb347584f78702918e2c6707",0);
                tx.addOutput("MUqH3bW9nTVHFZVPAhsYj2CjEyvU2RiyE8","MVS.ZDC",2);
                tx.addOutput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf","ETP",609995);
                return wallet.sign(tx);
            })
            .then((stx) => {
                return stx.encode()
            })
            .then((signed_raw_tx) => {
                signed_tx = signed_raw_tx.toString('hex');
                done();
            });
    });
    it('signed raw transaction equals test target', () => {
        assert.equal(signed_tx, "0200000003dff991ab3fc4f2d0a901eaa9b4749ae8d98eb3c3e6d33098697ba7fcc6815479010000006a47304402204fe2e45787bc119dc8baaa6c172e4186120da77570936738d8b68c425c8a815702207e169704406d7ca9233e2eed8744c2bbe5f6ee77887f48256754ff2a4554e5910121035550f8c20e914c4989dcd3521dccd4def479ff8d8e147ecf366cbd196e658712ffffffff3fdce1b35de6578eaa91eb0205f2cf2d6021024c5161a68e2f96fb6b50968006000000006b483045022100865cc44cb541db330b62b3fcc341a21c241955ebe6eea23eb8b7fe5b04a668df02207e4d99414840f4a6323b58d6c0c6213a91c55bc7d74f10e371b4c21adcd81eb70121035550f8c20e914c4989dcd3521dccd4def479ff8d8e147ecf366cbd196e658712ffffffff07672c8e910287f7847534fb820c0660922d52859a53f829dc9104f80ab26f37000000006b483045022100c05086d5986f20611f74318913e40a5583a26540facbce38e3f56261dbf0a8970220114605224e79425555aceafc8e337c2e37cb5537ccad24ea6ab55fabddb413e20121034593f54b073ed6a3728056d0f6595d614c717c639a9301761de7c8ef5d5fe1b4ffffffff0200000000000000001976a914e59eaa3c5f229767fd8190691b58c916ab89fbfd88ac010000000200000002000000074d56532e5a44430200000000000000cb4e0900000000001976a914e782fbba93466771c63d7a9fcc54d85efa26fd3488ac010000000000000000000000");
    });

});

describe('Asset transaction with previously locked ETP fee', function() {
    var signed_tx, wallet;
    beforeEach(function(done) {
        var w = Metaverse.wallet.fromMnemonic("nephew six select talk tennis embark inhale omit brush typical program elegant off stage profit floor avocado essay caught borrow minute acquire wreck pill")
            .then((w) => {
                wallet = w;
                var tx = new Metaverse.transaction();
                var builder = new Metaverse.transaction_builder();
                tx.addInput("MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB","53e05539209c80bf36b9f729f4d8c0f240e55b320814fdb074029b6bd5d3e967",0, "[ 7062 ] numequalverify dup hash160 [ 4fd34a03c3e140700c9324202a335bda6b5fddc3 ] equalverify checksig");
                tx.addInput("MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB","ca2b8afd277a7d846ccb0273849d4c764f80545008226c14bd98fe122054b3dc",0, "[ 7062 ] numequalverify dup hash160 [ 4fd34a03c3e140700c9324202a335bda6b5fddc3 ] equalverify checksig");
                tx.addInput("MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB","e713a445c67cd4333dde1c21ab144eb7cf9afad23b7cb4b4ae8854f688a7e6d0",0, "dup hash160 [ 4fd34a03c3e140700c9324202a335bda6b5fddc3 ] equalverify checksig");
                tx.addOutput("MJ38G9d3HXy2HrAfnzTVM6FgmQ8s5kLhcG","FOX",1);
                tx.addOutput("MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB","ETP",9);
                return wallet.sign(tx);
            })
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => {
                signed_tx = signed_raw_tx.toString('hex');
                done();
            });
    });
    it('signed raw transaction equals test target', () => {
        assert.equal(signed_tx, "020000000367e9d3d56b9b0274b0fd1408325be540f2c0d8f429f7b936bf809c203955e053000000006e483045022100f5d25ffff4f5f41d8e9ef9b9d9fc2d3ed077795bc7f90da4e524b577cbb27ff602205f4936d88c6e0c4dab90289885ed376698aa881df142366adc056b26a1173b01012103ad6500c83d2ea2d731b297a8d7d463eed3784d2dc0a089678bb81f88d0ae743d027062ffffffffdcb3542012fe98bd146c22085054804f764c9d847302cb6c847d7a27fd8a2bca000000006e483045022100830ff87902afe06c793994c0a8dde531a6ffc6ef259a5235dd98c6f24ead4099022034d40a5ab67d61010f276b5a9ed08f10f1b1ef2415eee3d0b46ce8d380a5a176012103ad6500c83d2ea2d731b297a8d7d463eed3784d2dc0a089678bb81f88d0ae743d027062ffffffffd0e6a788f65488aeb4b47c3bd2fa9acfb74e14ab211cde3d33d47cc645a413e7000000006b483045022100859b934954e6a124588e7984e80d7abe07b5bf271da41a13479a4adff39001c902200bb1394bbc74aab277cc5d8b4c870603a80868fdab4aea3530cab92b2ce5bd2e012103ad6500c83d2ea2d731b297a8d7d463eed3784d2dc0a089678bb81f88d0ae743dffffffff0200000000000000001976a9146f32f0d5afb05dd98a20df07946479440dde3e0088ac01000000020000000200000003464f58010000000000000009000000000000001976a9144fd34a03c3e140700c9324202a335bda6b5fddc388ac010000000000000000000000");
    });

});
