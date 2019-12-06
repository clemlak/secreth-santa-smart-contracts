/* eslint-env node */
/* global artifacts */

const SecretSanta = artifacts.require('SecretSanta');
const SantaNonFungibleToken = artifacts.require('SantaNonFungibleToken');

function deployContracts(deployer, network) {
  deployer.deploy(SecretSanta);

  if (network === 'development') {
    deployer.deploy(SantaNonFungibleToken);
  }
}

module.exports = deployContracts;
