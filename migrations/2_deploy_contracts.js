/* eslint-env node */
/* global artifacts */

const SecretSanta = artifacts.require('SecretSanta');
const SantaNonFungibleToken = artifacts.require('SantaNonFungibleToken');

function deployContracts(deployer, network) {
  const prizeDelay = network === 'mainnet' ? 60 * 60 * 24 * 14 : 60 * 60;

  deployer.deploy(SecretSanta, prizeDelay);

  if (network === 'development') {
    deployer.deploy(SantaNonFungibleToken, 'SantaNonFungibleToken', 'SNFT');
  }
}

module.exports = deployContracts;
