/* eslint-env node, mocha */
/* global artifacts, contract, assert */
/* eslint-disable no-await-in-loop */

const {
  expectEvent,
  expectRevert,
  time,
} = require('@openzeppelin/test-helpers');

const utils = require('web3-utils');

const SecretSanta = artifacts.require('SecretSanta');
const SantaFungibleToken = artifacts.require('SantaFungibleToken');
const SantaNonFungibleToken = artifacts.require('SantaNonFungibleToken');

contract('SecretSanta', (accounts) => {
  let secretSanta;
  let fungible;
  let nft;

  beforeEach(async () => {
    secretSanta = await SecretSanta.new();
    fungible = await SantaFungibleToken.new();
    nft = await SantaNonFungibleToken.new();
  });

  it('Should send one consolation', async () => {
    const tokenId = '0';

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId,
    );

    await nft.approve(
      secretSanta.address,
      tokenId,
    );

    await secretSanta.sendConsolation(
      [nft.address],
      [tokenId], {
        from: accounts[0],
      },
    );

    const secretSantas = await secretSanta.getSecretSantas();

    assert.equal(secretSantas.length, 1, 'Secret Santas total is wrong');
    assert.ok(secretSantas.includes(accounts[0]), 'Secret Santas is wrong');

    const owner = await nft.ownerOf(tokenId);
    assert.equal(owner, secretSanta.address, 'Token owner is wrong');
  });

  it('Should send one present after the consolation', async () => {
    const tokenId = '0';

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId,
    );

    await nft.approve(
      secretSanta.address,
      tokenId, {
        from: accounts[0],
      },
    );

    await secretSanta.sendConsolation(
      [nft.address],
      [tokenId], {
        from: accounts[0],
      },
    );

    const tokenId2 = '1';

    await nft.getSantaNonFungibleToken(
      accounts[1],
      tokenId2,
    );

    await nft.approve(
      secretSanta.address,
      tokenId2, {
        from: accounts[1],
      },
    );

    await secretSanta.sendPresent(
      [nft.address],
      [tokenId2], {
        from: accounts[1],
      },
    );

    const owner = await nft.ownerOf(tokenId2);

    assert.equal(owner, accounts[0], 'NFT owner is wrong');
  });

  it('Should send one present after the consolation', async () => {
    const tokenId = '0';

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId,
    );

    await nft.approve(
      secretSanta.address,
      tokenId, {
        from: accounts[0],
      },
    );

    await secretSanta.sendConsolation(
      [nft.address],
      [tokenId], {
        from: accounts[0],
      },
    );

    const tokenId2 = '1';

    await nft.getSantaNonFungibleToken(
      accounts[1],
      tokenId2,
    );

    await nft.approve(
      secretSanta.address,
      tokenId2, {
        from: accounts[1],
      },
    );

    await secretSanta.sendPresent(
      [nft.address],
      [tokenId2], {
        from: accounts[1],
      },
    );

    const owner = await nft.ownerOf(tokenId2);

    assert.equal(owner, accounts[0], 'Nft owner is wrong');
  });
});
