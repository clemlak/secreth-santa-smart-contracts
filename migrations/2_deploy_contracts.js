/* eslint-env node */
/* global artifacts */

const SecretSanta = artifacts.require('SecretSanta');
const SantaFungibleToken = artifacts.require('SantaFungibleToken');
const SantaNonFungibleToken = artifacts.require('SantaNonFungibleToken');

function deployContracts(deployer, network) {
  deployer.deploy(SecretSanta);

  if (network === 'development') {
    deployer.deploy(SantaFungibleToken);
    deployer.deploy(SantaNonFungibleToken);
  }
}

module.exports = deployContracts;
