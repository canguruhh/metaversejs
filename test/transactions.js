var assert = require('assert');
var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    Metaverse = require('../');
chai.use(chaiAsPromised);

describe('Transactions', function () {

    //Generate the wallet
    var wallet;
    beforeEach(() => Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero")
        .then((w) => {
            wallet = w;
            return wallet;
        })
    );

    it('Txid calculation', () => {
        var tx = Metaverse.transaction.calculateTxid('01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0403ec9311000000000130512310000000001976a9140b457055d28135f0d8d0956dd3c0642067e0106f88ac000000000000000000000000');
        Promise.resolve(tx.toString('hex'))
            .should.become("101d901c798c23e488e836a1d6f1cd46fbff7a771dc1501aa8c4c0f3b1b5ab77");
    });

    it('Signle input ETP transaction', () => {
        var tx = new Metaverse.transaction();
        tx.version = 2;
        tx.addInput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB", "5554b27dbf657d008511df56e747ffb2173749fd933b03317cee3c1fde271aea", 1);
        tx.addOutput("MVpxH8aAa3BAXvbdqUUJwEP6s2ajGKKtyd", "ETP", 1);
        tx.addOutput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB", "ETP", 4939995);
        return wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0200000001ea1a27de1f3cee7c31033b93fd493717b2ff47e756df1185007d65bf7db25455010000006b483045022100f8fa56d4f3015689c01f4557351e858aec4a139d752bc19b322390093393efc3022077d706621c3e36c8b6a90c6d354e8a85dd81d39a4e2fb582c0fd28f3f1a9caec0121034593f54b073ed6a3728056d0f6595d614c717c639a9301761de7c8ef5d5fe1b4ffffffff0201000000000000001976a914f087200b95bd043a134a0cead903e0a3600d79eb88ac0100000000000000db604b00000000001976a9147f8ac2a0179a4eb308c7ae837aed878b5ed25de288ac010000000000000000000000");
    });

    it('Multi input ETP transaction', () => {
        var tx = new Metaverse.transaction();
        tx.version = 2;
        tx.addInput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf", "c9c32b0723a57ce087f42df5bb5f98db404a886ef651842f844d59eca6412b27", 0);
        tx.addInput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB", "707cd4f639e292bd7cbf15c40e9c86d3bbec4c505ca09f6a72eded8313a927be", 1);
        tx.addOutput("MVpxH8aAa3BAXvbdqUUJwEP6s2ajGKKtyd", "ETP", 729995);
        tx.addOutput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf", "ETP", 619995);
        return wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0200000002272b41a6ec594d842f8451f66e884a40db985fbbf52df487e07ca523072bc3c9000000006b483045022100b71e952543ad8d937b9460a0d690132dbc8977f077ced43c4914665698868d5102202547633e9a914b68946db1b6007fad1b35e2c22f6dd014caf45da3860433b4c30121035550f8c20e914c4989dcd3521dccd4def479ff8d8e147ecf366cbd196e658712ffffffffbe27a91383eded726a9fa05c504cecbbd3869c0ec415bf7cbd92e239f6d47c70010000006b483045022100e5067916c7447bca7bb339d1e48ca54e6c84a21c244c9efb05904f71006ad2df02200a72348fb082c42bf707cc2e12288757e0f7cb81fdcdfea0ac21dc2c1e4855910121034593f54b073ed6a3728056d0f6595d614c717c639a9301761de7c8ef5d5fe1b4ffffffff028b230b00000000001976a914f087200b95bd043a134a0cead903e0a3600d79eb88ac0100000000000000db750900000000001976a914e782fbba93466771c63d7a9fcc54d85efa26fd3488ac010000000000000000000000");
    });

    it('Asset transaction', () => {
        var tx = new Metaverse.transaction();
        tx.version = 2;
        tx.addInput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf", "795481c6fca77b699830d3e6c3b38ed9e89a74b4a9ea01a9d0f2c43fab91f9df", 1);
        tx.addInput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf", "068096506bfb962f8ea661514c0221602dcff20502eb91aa8e57e65db3e1dc3f", 0);
        tx.addInput("MKXYH2MhpvA3GU7kMk8y3SoywGnyHEj5SB", "376fb20af80491dc29f8539a85522d9260060c82fb347584f78702918e2c6707", 0);
        tx.addOutput("MUqH3bW9nTVHFZVPAhsYj2CjEyvU2RiyE8", "MVS.ZDC", 2);
        tx.addOutput("MV1HEd7A4bCnLXhxXLHgWB2rurtS7xVWJf", "ETP", 609995);
        return wallet.sign(tx)
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("0200000003dff991ab3fc4f2d0a901eaa9b4749ae8d98eb3c3e6d33098697ba7fcc6815479010000006a47304402204fe2e45787bc119dc8baaa6c172e4186120da77570936738d8b68c425c8a815702207e169704406d7ca9233e2eed8744c2bbe5f6ee77887f48256754ff2a4554e5910121035550f8c20e914c4989dcd3521dccd4def479ff8d8e147ecf366cbd196e658712ffffffff3fdce1b35de6578eaa91eb0205f2cf2d6021024c5161a68e2f96fb6b50968006000000006b483045022100865cc44cb541db330b62b3fcc341a21c241955ebe6eea23eb8b7fe5b04a668df02207e4d99414840f4a6323b58d6c0c6213a91c55bc7d74f10e371b4c21adcd81eb70121035550f8c20e914c4989dcd3521dccd4def479ff8d8e147ecf366cbd196e658712ffffffff07672c8e910287f7847534fb820c0660922d52859a53f829dc9104f80ab26f37000000006b483045022100c05086d5986f20611f74318913e40a5583a26540facbce38e3f56261dbf0a8970220114605224e79425555aceafc8e337c2e37cb5537ccad24ea6ab55fabddb413e20121034593f54b073ed6a3728056d0f6595d614c717c639a9301761de7c8ef5d5fe1b4ffffffff0200000000000000001976a914e59eaa3c5f229767fd8190691b58c916ab89fbfd88ac010000000200000002000000074d56532e5a44430200000000000000cb4e0900000000001976a914e782fbba93466771c63d7a9fcc54d85efa26fd3488ac010000000000000000000000");
    });

    it('Asset transaction with previously locked ETP fee input', () => {
        var tx = new Metaverse.transaction();
        tx.version = 2;
        tx.addInput("MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB", "53e05539209c80bf36b9f729f4d8c0f240e55b320814fdb074029b6bd5d3e967", 0, "[ 7062 ] numequalverify dup hash160 [ 4fd34a03c3e140700c9324202a335bda6b5fddc3 ] equalverify checksig");
        tx.addInput("MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB", "ca2b8afd277a7d846ccb0273849d4c764f80545008226c14bd98fe122054b3dc", 0, "[ 7062 ] numequalverify dup hash160 [ 4fd34a03c3e140700c9324202a335bda6b5fddc3 ] equalverify checksig");
        tx.addInput("MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB", "e713a445c67cd4333dde1c21ab144eb7cf9afad23b7cb4b4ae8854f688a7e6d0", 0, "dup hash160 [ 4fd34a03c3e140700c9324202a335bda6b5fddc3 ] equalverify checksig");
        tx.addOutput("MJ38G9d3HXy2HrAfnzTVM6FgmQ8s5kLhcG", "FOX", 1);
        tx.addOutput("MFBEjD9QwgTxnRiUGd2qXATYxcReyG5ZtB", "ETP", 9);
        return Metaverse.wallet.fromMnemonic("nephew six select talk tennis embark inhale omit brush typical program elegant off stage profit floor avocado essay caught borrow minute acquire wreck pill")
            .then((wallet) => wallet.sign(tx))
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("020000000367e9d3d56b9b0274b0fd1408325be540f2c0d8f429f7b936bf809c203955e053000000006e483045022100f5d25ffff4f5f41d8e9ef9b9d9fc2d3ed077795bc7f90da4e524b577cbb27ff602205f4936d88c6e0c4dab90289885ed376698aa881df142366adc056b26a1173b01012103ad6500c83d2ea2d731b297a8d7d463eed3784d2dc0a089678bb81f88d0ae743d027062ffffffffdcb3542012fe98bd146c22085054804f764c9d847302cb6c847d7a27fd8a2bca000000006e483045022100830ff87902afe06c793994c0a8dde531a6ffc6ef259a5235dd98c6f24ead4099022034d40a5ab67d61010f276b5a9ed08f10f1b1ef2415eee3d0b46ce8d380a5a176012103ad6500c83d2ea2d731b297a8d7d463eed3784d2dc0a089678bb81f88d0ae743d027062ffffffffd0e6a788f65488aeb4b47c3bd2fa9acfb74e14ab211cde3d33d47cc645a413e7000000006b483045022100859b934954e6a124588e7984e80d7abe07b5bf271da41a13479a4adff39001c902200bb1394bbc74aab277cc5d8b4c870603a80868fdab4aea3530cab92b2ce5bd2e012103ad6500c83d2ea2d731b297a8d7d463eed3784d2dc0a089678bb81f88d0ae743dffffffff0200000000000000001976a9146f32f0d5afb05dd98a20df07946479440dde3e0088ac01000000020000000200000003464f58010000000000000009000000000000001976a9144fd34a03c3e140700c9324202a335bda6b5fddc388ac010000000000000000000000");
    });

    it('ETP transaction with previously stakelocked output', () => {
        var tx = new Metaverse.transaction();
        tx.addInput("tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ", "a4425f7e072a954b31db86c8dde42f13831e4a01b19b5f9a7306006382837210", 1, 'dup hash160 [ 3e995f80739ecbfad8d92e3e523c540bd2847ffd ] equalverify checksig');
        tx.addInput("tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ", "a4425f7e072a954b31db86c8dde42f13831e4a01b19b5f9a7306006382837210", 0, '[ 14 ] checksequenceverify drop dup hash160 [ 3e995f80739ecbfad8d92e3e523c540bd2847ffd ] equalverify checksig');
        tx.addOutput("tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ", "ETP", 10000000000, "metaverse").specifyDid("metaverse", 'metaverse');
        tx.addOutput("tCdbgEP2kNS9qAoSnRnoN6nDMhvCugNVgZ", "ETP", 7813848630);
        return Metaverse.wallet.fromMnemonic("lunar there win define minor shadow damage lounge bitter abstract sail alcohol yellow left lift vapor tourist rent gloom sustain gym dry congress zero", 'testnet')
            .then((wallet) => wallet.sign(tx))
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become("040000000210728382630006739a5f9bb1014a1e83132fe4ddc886db314b952a077e5f42a4010000006a473044022030b698ace5161d3660a466a269b9784061591a5557aa7ad1efd0f068b48553e102207fe278564305fa08acb1ced0f6a96e7d1a6d7f4e6789446c2e8ee0242c0c0cce01210358068a43bb405201db2a19fd488431a34ed0949891b206a30d1d5d120ba90445ffffffff10728382630006739a5f9bb1014a1e83132fe4ddc886db314b952a077e5f42a4000000006a473044022048b7c634478334483080f4c65a74d271b79bf4df06343650de3231014ed78a7902201a3cbb0f624ba1b3988375819dc8d22f946014cf5a34a3734eb4d36c1dfd573d01210358068a43bb405201db2a19fd488431a34ed0949891b206a30d1d5d120ba90445140000000200e40b54020000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88accf00000000000000096d6574617665727365096d657461766572736536debdd1010000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac010000000000000000000000");
    });

    it('Encode decoded transaction with attenuation model', () => {
        var tx = Metaverse.transaction.decode('04000000021357535806f9fa8f3070cbbd1cff579067867ea501f28973be68a33184e36637000000000005000000fe8b8a9872b3b6af4708fb8515a7a08e1975bf71222c675228daec4cb31d9fff0100000000ffffffff030000000000000000634d2100504e3d303b4c483d31303b545950453d313b4c513d313b4c503d31303b554e3d31240000000000000000000000000000000000000000000000000000000000000000ffffffffb276a9146052b015d31cfeb403fe50128e440bde5d2650ec88accf00000002000000076c617572656e7400020000000548414c4c4f010000000000000000000000000000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac0100000002000000020000000548414c4c4f7900000000000000f0bc0b54020000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac010000000000000000000000', Metaverse.networks.testnet)
        return Promise.resolve(tx.encode().toString('hex'))
            .should.become("04000000021357535806f9fa8f3070cbbd1cff579067867ea501f28973be68a33184e36637000000000005000000fe8b8a9872b3b6af4708fb8515a7a08e1975bf71222c675228daec4cb31d9fff0100000000ffffffff030000000000000000634d2100504e3d303b4c483d31303b545950453d313b4c513d313b4c503d31303b554e3d31240000000000000000000000000000000000000000000000000000000000000000ffffffffb276a9146052b015d31cfeb403fe50128e440bde5d2650ec88accf00000002000000076c617572656e7400020000000548414c4c4f010000000000000000000000000000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac0100000002000000020000000548414c4c4f7900000000000000f0bc0b54020000001976a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88ac010000000000000000000000");
    });

    it('Sign decoded asset transaction with attenuation model', () => {
        var tx = Metaverse.transaction.decode('0400000002da6931b45b5ab033e0dc4135234a4d1f25ae67f66e912a414bea1caf8ee33eb90100000000ffffffffda6931b45b5ab033e0dc4135234a4d1f25ae67f66e912a414bea1caf8ee33eb90200000000ffffffff0300000000000000006525504e3d303b4c483d31303b545950453d313b4c513d31303030303b4c503d31303b554e3d31240000000000000000000000000000000000000000000000000000000000000000ffffffffb276a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88accf00000002000000096d657461766572736500020000000754455354312e31102700000000000000000000000000001976a91485df6dc5a453fcaba91531e4d6b21e8fe3ee359088ac0100000002000000020000000754455354312e31e051724e18090000c0a9106c2a0800001976a91485df6dc5a453fcaba91531e4d6b21e8fe3ee359088ac010000000000000000000000', Metaverse.networks.testnet)
        tx.inputs[0].address = 'tK8TaQix9QSgaAAPTaUj7NwKMfbkWRKgVf'
        tx.inputs[0].previous_output.address = 'tK8TaQix9QSgaAAPTaUj7NwKMfbkWRKgVf'
        tx.inputs[1].address = 'tK8TaQix9QSgaAAPTaUj7NwKMfbkWRKgVf'
        tx.inputs[1].previous_output.address = 'tK8TaQix9QSgaAAPTaUj7NwKMfbkWRKgVf'
        return Metaverse.wallet.fromMnemonic("trial lion inner game clap alpha divide blame elder because alien immune deer tenant artwork book fiber pond rather dragon bread utility lecture obscure", 'testnet')
            .then((wallet) => wallet.sign(tx))
            .then((stx) => stx.encode())
            .then((signed_raw_tx) => signed_raw_tx.toString('hex'))
            .should.become('0400000002da6931b45b5ab033e0dc4135234a4d1f25ae67f66e912a414bea1caf8ee33eb9010000006b4830450221009f62e933d296ec72517bb4517aecc54a04e04132e86d96724da19ef276383ad602202eb3c472534932588f667b55029bb21bba3380497eaf0524d988120a61cec77a012102cfa7977da665ed17840813c0afa4e6b3be7bcd6c33fca12561e0ffab5a823adfffffffffda6931b45b5ab033e0dc4135234a4d1f25ae67f66e912a414bea1caf8ee33eb9020000006b483045022100b4f13015a10228c88d3ccb88d9604dcb7faa7e799c0926bcfc8b5619dc1697c8022076ac6017d83816b204b22b88faf1a030430263e37db5d1404d7fdd60a5101a4f012102cfa7977da665ed17840813c0afa4e6b3be7bcd6c33fca12561e0ffab5a823adfffffffff030000000000000000674d2500504e3d303b4c483d31303b545950453d313b4c513d31303030303b4c503d31303b554e3d31240000000000000000000000000000000000000000000000000000000000000000ffffffffb276a9143e995f80739ecbfad8d92e3e523c540bd2847ffd88accf00000002000000096d657461766572736500020000000754455354312e31102700000000000000000000000000001976a91485df6dc5a453fcaba91531e4d6b21e8fe3ee359088ac0100000002000000020000000754455354312e31e051724e18090000c0a9106c2a0800001976a91485df6dc5a453fcaba91531e4d6b21e8fe3ee359088ac010000000000000000000000');
    });



});
