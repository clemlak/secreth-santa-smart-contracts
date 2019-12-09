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
    secretSanta = await SecretSanta.new(60 * 5);
    nft = await SantaNonFungibleToken.new('SantaNonFungibleToken', 'SNFT');
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

  it('Should send a prize', async () => {
    const tokenId = '0';

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId,
      '',
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

    await secretSanta.sendPrize(
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

    const prize = await secretSanta.getPrize();

    assert.ok(prize.tokens.includes(nft.address), 'Prize tokens are wrong');
    assert.ok(prize.tokensId[0].eq(utils.toBN(tokenId)), 'Prize tokens IDs are wrong');
  });

  it('Should NOT send a prize', async () => {
    const tokenId = '0';

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId,
      '',
    );

    await nft.approve(
      secretSanta.address,
      tokenId,
    );

    await expectRevert(
      secretSanta.sendPrize(
        [nft.address],
        [tokenId], {
          from: accounts[0],
        },
      ),
      'Token not whitelisted',
    );
  });

  it('Should send one present after the prize', async () => {
    const tokenId = '0';

    await secretSanta.updateWhitelist(
      [nft.address],
      true, {
        from: accounts[0],
      },
    );

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId,
      '', {
        from: accounts[0],
      },
    );

    await nft.approve(
      secretSanta.address,
      tokenId, {
        from: accounts[0],
      },
    );

    await secretSanta.sendPrize(
      [nft.address],
      [tokenId], {
        from: accounts[0],
      },
    );

    const tokenId2 = '1';

    await nft.getSantaNonFungibleToken(
      accounts[1],
      tokenId2,
      '', {
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

  it('Should send a prize, one present, and claim the prize', async () => {
    const tokenId = '0';

    await secretSanta.updateWhitelist(
      [nft.address],
      true, {
        from: accounts[0],
      },
    );

    await nft.getSantaNonFungibleToken(
      accounts[0],
      tokenId,
      '', {
        from: accounts[0],
      },
    );

    await nft.approve(
      secretSanta.address,
      tokenId, {
        from: accounts[0],
      },
    );

    await secretSanta.sendPrize(
      [nft.address],
      [tokenId], {
        from: accounts[0],
      },
    );

    const tokenId2 = '1';

    await nft.getSantaNonFungibleToken(
      accounts[1],
      tokenId2,
      '', {
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
    let prizeDelay = await secretSanta.prizeDelay();

    if (!utils.isBN(lastPresentAt)) {
      lastPresentAt = utils.toBN(lastPresentAt);
    }

    if (!utils.isBN(prizeDelay)) {
      prizeDelay = utils.toBN(prizeDelay);
    }

    await time.increaseTo(lastPresentAt.add(prizeDelay.add(prizeDelay)));

    await secretSanta.claimPrize({
      from: accounts[1],
    });

    const prizeOwner = await nft.ownerOf(tokenId);
    assert.equal(prizeOwner, accounts[1], 'NFT owner is wrong');
  });
});
