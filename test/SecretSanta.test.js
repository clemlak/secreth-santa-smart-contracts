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
const SantaNonFungibleToken = artifacts.require('SantaNonFungibleToken');

contract('SecretSanta', (accounts) => {
  let secretSanta;
  let nft;

  beforeEach(async () => {
    secretSanta = await SecretSanta.new();
    nft = await SantaNonFungibleToken.new();
  });

  it('Should whitelist a token contract', async () => {
    await secretSanta.updateWhitelist(
      [nft.address],
      true, {
        from: accounts[0],
      },
    );

    const isApproved = await secretSanta.whitelist(nft.address);
    assert.ok(isApproved, 'Token contract is not whitelisted');
  });

  it('Should NOT whitelist a token contract', async () => {
    await expectRevert(
      secretSanta.updateWhitelist(
        [nft.address],
        true, {
          from: accounts[1],
        },
      ),
      'Ownable: caller is not the owner',
    );
  });

  it('Should send a consolation', async () => {
    const tokenId = '0';

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId,
    );

    await nft.approve(
      secretSanta.address,
      tokenId,
    );

    await secretSanta.updateWhitelist(
      [nft.address],
      true, {
        from: accounts[0],
      },
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

    const consolation = await secretSanta.getConsolation();

    assert.ok(consolation.tokens.includes(nft.address), 'Consolation tokens are wrong');
    assert.ok(consolation.tokensId[0].eq(utils.toBN(tokenId)), 'Consolation tokens IDs are wrong');
  });

  it('Should NOT send a consolation', async () => {
    const tokenId = '0';

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId,
    );

    await nft.approve(
      secretSanta.address,
      tokenId,
    );

    await expectRevert(
      secretSanta.sendConsolation(
        [nft.address],
        [tokenId], {
          from: accounts[0],
        },
      ),
      'Token not whitelisted',
    );
  });

  it('Should send one present after the consolation', async () => {
    const tokenId = '0';

    await secretSanta.updateWhitelist(
      [nft.address],
      true, {
        from: accounts[0],
      },
    );

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId, {
        from: accounts[0],
      },
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
      tokenId2, {
        from: accounts[1],
      },
    );

    await nft.approve(
      secretSanta.address,
      tokenId2, {
        from: accounts[1],
      },
    );

    await secretSanta.sendPresent(
      nft.address,
      tokenId2, {
        from: accounts[1],
      },
    );

    const owner = await nft.ownerOf(tokenId2);
    assert.equal(owner, accounts[0], 'NFT owner is wrong');
  });

  it('Should send a consolation, one present, and claim the consolation', async () => {
    const tokenId = '0';

    await secretSanta.updateWhitelist(
      [nft.address],
      true, {
        from: accounts[0],
      },
    );

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId, {
        from: accounts[0],
      },
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
      tokenId2, {
        from: accounts[1],
      },
    );

    await nft.approve(
      secretSanta.address,
      tokenId2, {
        from: accounts[1],
      },
    );

    await secretSanta.sendPresent(
      nft.address,
      tokenId2, {
        from: accounts[1],
      },
    );

    const owner = await nft.ownerOf(tokenId2);
    assert.equal(owner, accounts[0], 'NFT owner is wrong');

    let lastPresentAt = await secretSanta.lastPresentAt();
    let consolationDelay = await secretSanta.consolationDelay();

    if (!utils.isBN(lastPresentAt)) {
      lastPresentAt = utils.toBN(lastPresentAt);
    }

    if (!utils.isBN(consolationDelay)) {
      consolationDelay = utils.toBN(consolationDelay);
    }

    await time.increaseTo(lastPresentAt.add(consolationDelay.add(consolationDelay)));

    await secretSanta.claimConsolation({
      from: accounts[1],
    });

    const consolationOwner = await nft.ownerOf(tokenId);
    assert.equal(consolationOwner, accounts[1], 'NFT owner is wrong');
  });
});
