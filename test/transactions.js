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
                tx.addOutput("MVpxH8aAa3BAXvbdqUUJwEP6s2ajGKKtyd","ETP",1,"dup hash160 [ f087200b95bd043a134a0cead903e0a3600d79eb ] equalverify checksig");
                tx.addOutput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB","ETP",4939995,"dup hash160 [ 7f8ac2a0179a4eb308c7ae837aed878b5ed25de2 ] equalverify checksig");
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
    it('signed raw transaction script is correct', () => {
        assert.equal(script, "[ 3045022100f8fa56d4f3015689c01f4557351e858aec4a139d752bc19b322390093393efc3022077d706621c3e36c8b6a90c6d354e8a85dd81d39a4e2fb582c0fd28f3f1a9caec01 ] [ 034593f54b073ed6a3728056d0f6595d614c717c639a9301761de7c8ef5d5fe1b4 ]");
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
                tx.addOutput("MVpxH8aAa3BAXvbdqUUJwEP6s2ajGKKtyd","ETP",729995,"dup hash160 [ f087200b95bd043a134a0cead903e0a3600d79eb ] equalverify checksig");
                tx.addOutput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf","ETP",619995,"dup hash160 [ e782fbba93466771c63d7a9fcc54d85efa26fd34 ] equalverify checksig");
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
                tx.addOutput("MUqH3bW9nTVHFZVPAhsYj2CjEyvU2RiyE8","MVS.ZDC",2,"dup hash160 [ e59eaa3c5f229767fd8190691b58c916ab89fbfd ] equalverify checksig");
                tx.addOutput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf","ETP",609995,"dup hash160 [ e782fbba93466771c63d7a9fcc54d85efa26fd34 ] equalverify checksig");
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
