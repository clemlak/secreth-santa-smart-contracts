/* eslint-env node */
/* global artifacts */

const SecretSanta = artifacts.require('SecretSanta');
const SantaToken = artifacts.require('SantaToken');

function deployContracts(deployer, network) {
  deployer.deploy(SecretSanta);

  if (network === 'development') {
    deployer.deploy(SantaToken);
  }
}

module.exports = deployContracts;
