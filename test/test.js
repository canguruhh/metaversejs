var chai = require('chai');
var expect = chai.expect;
var Metaverse = require('..');

describe('Transaction testing', () => {
    describe('Add input', () => {
        let tx = new Metaverse.transaction();
        tx.addInput('abc', 'cde', 1);
        it('Address', () => {
            expect(tx.inputs[0].address).to.equal('abc');
        });
        it('Previous output address', () => {
            expect(tx.inputs[0].previous_output.hash).to.equal('cde');
        });
        it('Previous output index', () => {
            expect(tx.inputs[0].previous_output.index).to.equal(1);
        });
    });
    describe('Add ETP output', () => {
        let tx = new Metaverse.transaction();
        tx.addOutput('abc', 'ETP', 10000, '');
        it('Address', () => {
            expect(tx.outputs[0].address).to.equal('abc');
        });
        it('Output version', () => {
            expect(tx.outputs[0].attachment.version).to.equal(1);
        });
        it('Output asset', () => {
            expect(tx.outputs[0].attachment.type).to.equal(Metaverse.constants.ATTACHMENT.TYPE.ETP_TRANSFER);
        });
        it('Output value', () => {
            expect(tx.outputs[0].value).to.equal(10000);
        });
    });
    describe('Add asset output', () => {
        let tx = new Metaverse.transaction();
        tx.addOutput('abc', 'MVS.ZGC', 10000, '');
        it('Address', () => {
            expect(tx.outputs[0].address).to.equal('abc');
        });
        it('Output version', () => {
            expect(tx.outputs[0].attachment.version).to.equal(1);
        });
        it('Output status', () => {
            expect(tx.outputs[0].attachment.status).to.equal(2);
        });
        it('Output asset', () => {
            expect(tx.outputs[0].attachment.symbol).to.equal('MVS.ZGC');
        });
        it('Output status', () => {
            expect(tx.outputs[0].attachment.status).to.equal(2);
            expect(tx.outputs[0].value).to.equal(0);
        });
        it('Output value', () => {
            expect(tx.outputs[0].value).to.equal(0);
            expect(tx.outputs[0].attachment.quantity).to.equal(10000);
        });
    });
    describe('Clear input scripts', () => {
        let tx = new Metaverse.transaction();
        tx.addInput('abc', 'cde', 1);
        tx.addInput('abc', 'cde', 1);
        tx.addInput('abc', 'cde', 1);
        tx.addInput('abc', 'cde', 1);
        tx.addInput('abc', 'cde', 1);
        tx.inputs.forEach((input)=>{
            input.script="abc";
        });

        it('Not empty inilialization', () => {
            tx.inputs.forEach((input)=>{
                expect(input.script).to.not.equal('');
            });
        });
        it('Scripts cleared', () => {
            tx.clearInputScripts();
            tx.inputs.forEach((input)=>{
                expect(input.script.length).to.equal(0);
            });
        });
    });
});
