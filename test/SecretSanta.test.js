/* eslint-env node, mocha */
/* global artifacts, contract, assert */

const SecretSanta = artifacts.require('SecretSanta');

let instance;

contract('SecretSanta', (accounts) => {
  it('Should deploy an instance of the SecretSanta contract', () => SecretSanta.deployed()
    .then((contractInstance) => {
      instance = contractInstance;
    }));

  it('Should set the number', () => instance.setNumber(2, {
    from: accounts[0],
  }));

  it('Should get the number', () => instance.getNumber()
    .then((number) => {
      assert.equal(number.toNumber(), 2, 'Number is wrong!');
    }));
});
