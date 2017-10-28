module.exports = {
	mainnet: {
		    messagePrefix: '\x18Bitcoin Signed Message:\n',
		    bech32: 'bc',
		    bip32: {
			          public: 0x0488b21e,
			          private: 0x0488ade4
			        },
		    pubKeyHash: 0x32,
		    scriptHash: 0x05,
		    wif: 0x80
		  },
	  testnet: {
		      messagePrefix: '\x18Bitcoin Signed Message:\n',
		      bech32: 'tb',
		      bip32: {
			            public: 0x043587cf,
			            private: 0x04358394
			          },
		      pubKeyHash: 0x7f,
		      scriptHash: 0xc4,
		      wif: 0xef
		    }
};
