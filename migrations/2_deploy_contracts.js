/* eslint-env node */
/* global artifacts */

const SecretSanta = artifacts.require('SecretSanta');

function deployContracts(deployer) {
  deployer.deploy(SecretSanta);
}

module.exports = deployContracts;
