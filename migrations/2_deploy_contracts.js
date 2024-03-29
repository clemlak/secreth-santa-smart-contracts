/* eslint-env node */
/* global artifacts */

const SecretSanta = artifacts.require('SecretSanta');
const SantaNonFungibleToken = artifacts.require('SantaNonFungibleToken');

function deployContracts(deployer, network) {
  const prizeDelay = network === 'live' ? 60 * 60 * 24 * 3 : 60 * 60 * 3;

  deployer.deploy(SecretSanta, prizeDelay);

  if (network === 'development') {
    deployer.deploy(SantaNonFungibleToken, 'SantaNonFungibleToken', 'SNFT');
  }
}

module.exports = deployContracts;
