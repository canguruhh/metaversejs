const base58check = require('base58check');

class Address {
    static validate(address, network = 'mainnet', throwError = false) {
        try {
            base58check.decode(address);
            if (address[0] !== '3' && address[0] !== (network === 'mainnet' ? 'M' : 't')) {
                if (throwError) throw Error('Prefix mismatch');
                return false;
            }
            return true;
        } catch (error) {
            if (throwError) throw Error(error.message);
            return false;
        }
    }
}

module.exports = Address;