'use strict';
var Transaction = require('./transaction.js');
var Output = require('./output.js');

function TransactionBuilder() {}

/**
 * Generates a send (etp and or asset) transaction with the given utxos as inputs, assets and the change.
 * @param {Array<Output>} utxo Inputs for the transaction
 * @param {String} recipient_address Recipient address
 * @param {Object} target Definition of assets to send
 * @param {String} change_address Change address
 * @param {Object} change Definition of change assets
 */
TransactionBuilder.send = function(utxo, recipient_address, target, change_address, change, fee, messages) {
    return new Promise((resolve, reject) => {
        //Set fee
        if (fee == undefined)
            fee = Transaction.DEFAULT_FEE;
        var etpcheck = 0;
        //create new transaction
        let tx = new Transaction();
        //add inputs
        utxo.forEach((output) => {
            if (output.value)
                etpcheck += output.value;
            tx.addInput(output.address, output.hash, output.index, output.script);
        });
        if (messages == undefined)
            messages = [];
        messages.forEach((message) => tx.addMessage(recipient_address, message));
        //add the target outputs to the recipient
        Object.keys(target).forEach((symbol) => (target[symbol]) ? tx.addOutput(recipient_address, symbol, target[symbol]) : null);
        if (target.ETP)
            etpcheck -= target.ETP;
        //add the change outputs
        Object.keys(change).forEach((symbol) => tx.addOutput(change_address, symbol, -change[symbol]));
        if (change.ETP)
            etpcheck += change.ETP;
        if (etpcheck !== fee) throw Error('ERR_FEE_CHECK_FAILED');
        resolve(tx);
    });
};

/**
 * Generates an etp deposit transaction.
 * @param {Array<Output>} utxo Inputs for the transaction
 * @param {String} recipient_address Recipient address
 * @param {Number} quantity Quantity of ETP to deposit (in bits)
 * @param {Number} duration Number of blocks to freeze
 * @param {String} change_address Change address
 * @param {Object} change Definition of change assets
 * @param {Number} fee Optional fee definition (default 10000 bits)
 */
TransactionBuilder.deposit = function(utxo, recipient_address, quantity, duration, change_address, change, fee, network) {
    return new Promise((resolve, reject) => {
        //Set fee
        if (fee == undefined)
            fee = Transaction.DEFAULT_FEE;
        var etpcheck = 0;
        //create new transaction
        let tx = new Transaction();
        //add inputs
        utxo.forEach((output) => {
            if (output.value)
                etpcheck += output.value;
            tx.addInput(output.address, output.hash, output.index, output.script);
        });
        //add lock output to the recipient
        tx.addLockOutput(recipient_address, quantity, duration, network);
        etpcheck -= quantity;
        //add the change outputs
        Object.keys(change).forEach((symbol) => tx.addOutput(change_address, symbol, -change[symbol]));
        if (change.ETP)
            etpcheck += change.ETP;
        if (etpcheck !== fee) throw Error('ERR_FEE_CHECK_FAILED');
        resolve(tx);
    });
};

/**
 * Generates a create avatar transaction.
 * @param {Array<Output>} utxo Inputs for the transaction
 * @param {String} avatar_address Recipient address
 * @param {String} symbol Symbol of avatar
 * @param {String} change_address Change address
 * @param {Object} change Definition of change assets
 */
TransactionBuilder.issueDid = function(utxo, avatar_address, symbol, change_address, change) {
    return new Promise((resolve, reject) => {
        //Set fee
        var fee = Transaction.AVATAR_CREATE_DEFAULT_FEE;
        var etpcheck = 0;
        //create new transaction
        let tx = new Transaction();
        //add inputs
        utxo.forEach((output) => {
            if (output.value)
                etpcheck += output.value;
            tx.addInput(output.address, output.hash, output.index, output.script);
        });
        //add avatar output to the avatar address
        tx.addDidIssueOutput(avatar_address, symbol, avatar_address);
        //add the change outputs
        Object.keys(change).forEach((symbol) => tx.addOutput(change_address, symbol, -change[symbol]));
        if (change.ETP)
            etpcheck += change.ETP;
        if (etpcheck !== fee) throw Error('ERR_FEE_CHECK_FAILED');
        resolve(tx);
    });
};

/**
 * Generates an asset issue transaction.
 * @param {Array<Output>} inputs Inputs for the transaction
 * @param {String} recipient_address Recipient address
 * @param {String} symbol Symbol of the new asset
 * @param {Number} max_supply The maximum supply of the asset
 * @param {Number} precision The number of decimal places
 * @param {String} issuer Public issuer name
 * @param {String} description Public description
 * @param {Number} secondaryissue_threshold -1: no limitation; 0: no secondaryissue; 1..100 threshold user has to hold to be able to do secondary issue
 * @param {Boolean} is_secondaryissue indication if this output is a secondary issue of an existing asset
 * @param {String} change_address Change address
 * @param {Object} change Definition of change assets
 * @param {Object} change Definition of change assets
 * @param {Boolean} issue_domain indication if the toplevel domain certificate should be included as an output
 * @param {Number} fee Optional fee definition (default 10000 bits)
 */
TransactionBuilder.issueAsset = function(inputs, recipient_address, symbol, max_supply, precision, issuer, description, secondaryissue_threshold, is_secondaryissue, change_address, change, issue_domain, fee) {
    return new Promise((resolve, reject) => {
        //Set fee
        fee = (fee) ? fee : 1000000000;
        var etpcheck = 0;
        //create new transaction
        let tx = new Transaction();

        //reissue used certs
        let certs = [];
        //add inputs
        inputs.forEach((input) => {
            if (input.value)
                etpcheck += input.value;
            tx.addInput(input.address, input.hash, input.index, input.script);
            if (input.attachment && input.attachment.type == 'asset-cert') {
                switch (input.attachment.cert_type) {
                    case 'domain':
                    case 'issue':
                        certs.push(input);
                        break;
                    case 'naming':
                        break;
                    default:
                        console.error('Unknown cert type: ' + input.attachment.cert_type);
                        throw ('ERR_UNKNOWN_CERT_TYPE');
                }
            }
        });
        //add lock output to the recipient
        tx.addAssetIssueOutput(symbol, max_supply, precision, issuer, recipient_address, description, secondaryissue_threshold, is_secondaryissue).specifyDid(issuer, issuer);
        //add certificate to secondaryissue if necessary
        if (secondaryissue_threshold !== 0)
            tx.addCertOutput(symbol, issuer, recipient_address, 'issue').specifyDid(recipient_address, recipient_address);
        //reissue used certs
        certs.forEach(cert=>{
            tx.addCertOutput(cert.attachment.symbol, cert.attachment.owner, cert.address, cert.attachment.cert_type).specifyDid(cert.attachment.to_did, cert.attachment.from_did);
        });
        //add toplevel domain certificate if wanted
        if (issue_domain)
            tx.addCertOutput(symbol.split(".")[0], issuer, recipient_address, 'domain').specifyDid(issuer, issuer);
        //add the change outputs
        Object.keys(change).forEach((symbol) => tx.addOutput(change_address, symbol, -change[symbol]));
        if (change.ETP)
            etpcheck += change.ETP;
        if (etpcheck !== fee) throw Error('ERR_FEE_CHECK_FAILED');
        resolve(tx);
    });
};


module.exports = TransactionBuilder;
