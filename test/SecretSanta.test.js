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

const max = 25;

contract('SecretSanta', (accounts) => {
  let secretSanta;
  let nfts = [];
  let contractsByAddress = {};

  beforeEach(async () => {
    secretSanta = await SecretSanta.new(60 * 5);
    nfts = [];
    contractsByAddress = {};

    for (let i = 0; i < max; i += 1) {
      const nft = await SantaNonFungibleToken.new('SantaNonFungibleToken', 'SNFT');
      contractsByAddress[nft.address] = nft;

      nfts.push(nft);
    }
  });

  it('Should whitelist a token contract', async () => {
    await secretSanta.updateWhitelist(
      [nfts[0].address],
      true, {
        from: accounts[0],
      },
    );

    const isApproved = await secretSanta.whitelist(nfts[0].address);
    assert.ok(isApproved, 'Token contract is not whitelisted');
  });

  it('Should NOT whitelist a token contract', async () => {
    await expectRevert(
      secretSanta.updateWhitelist(
        [nfts[0].address],
        true, {
          from: accounts[1],
        },
      ),
      'Ownable: caller is not the owner',
    );
  });

  it('Should send a prize', async () => {
    const tokenId = '0';

    await nfts[0].getSantaNonFungibleToken(
      accounts[0],
      tokenId,
      '',
    );

    await nfts[0].approve(
      secretSanta.address,
      tokenId,
    );

    await secretSanta.updateWhitelist(
      [nfts[0].address],
      true, {
        from: accounts[0],
      },
    );

    await secretSanta.sendPrize(
      [nfts[0].address],
      [tokenId], {
        from: accounts[0],
      },
    );

    const owner = await nfts[0].ownerOf(tokenId);
    assert.equal(owner, secretSanta.address, 'Token owner is wrong');

    const prize = await secretSanta.getPrize();

    assert.ok(prize.tokens.includes(nfts[0].address), 'Prize tokens are wrong');
    assert.ok(prize.tokensId[0].eq(utils.toBN(tokenId)), 'Prize tokens IDs are wrong');
  });

  it('Should not send a prize', async () => {
    const tokenId = '0';

    await nfts[0].getSantaNonFungibleToken(
      accounts[0],
      tokenId,
      '',
    );

    await nfts[0].approve(
      secretSanta.address,
      tokenId,
    );

    await expectRevert(
      secretSanta.sendPrize(
        [nfts[0].address],
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
      [nfts[0].address],
      true, {
        from: accounts[0],
      },
    );

    await nfts[0].getSantaNonFungibleToken(
      accounts[0],
      tokenId,
      '', {
        from: accounts[0],
      },
    );

    await nfts[0].approve(
      secretSanta.address,
      tokenId, {
        from: accounts[0],
      },
    );

    await secretSanta.sendPrize(
      [nfts[0].address],
      [tokenId], {
        from: accounts[0],
      },
    );

    const tokenId2 = '1';

    await nfts[0].getSantaNonFungibleToken(
      accounts[1],
      tokenId2,
      '', {
        from: accounts[1],
      },
    );

    await nfts[0].approve(
      secretSanta.address,
      tokenId2, {
        from: accounts[1],
      },
    );

    const receipt = await secretSanta.sendPresent(
      nfts[0].address,
      tokenId2, {
        from: accounts[1],
      },
    );

    expectEvent(receipt, 'PresentSent', {
      from: accounts[1],
      to: accounts[0],
      token: nfts[0].address,
      tokenId: tokenId2,
    });

    const owner = await nfts[0].ownerOf(tokenId2);
    assert.equal(owner, accounts[0], 'NFT owner is wrong');

    const lastSecretSanta = await secretSanta.lastSecretSanta();
    assert.equal(lastSecretSanta, accounts[1]);
  });

  it('Should send a prize, one present, and claim the prize', async () => {
    const tokenId = '0';

    await secretSanta.updateWhitelist(
      [nfts[0].address],
      true, {
        from: accounts[0],
      },
    );

    await nfts[0].getSantaNonFungibleToken(
      accounts[0],
      tokenId,
      '', {
        from: accounts[0],
      },
    );

    await nfts[0].approve(
      secretSanta.address,
      tokenId, {
        from: accounts[0],
      },
    );

    await secretSanta.sendPrize(
      [nfts[0].address],
      [tokenId], {
        from: accounts[0],
      },
    );

    const tokenId2 = '1';

    await nfts[0].getSantaNonFungibleToken(
      accounts[1],
      tokenId2,
      '', {
        from: accounts[1],
      },
    );

    await nfts[0].approve(
      secretSanta.address,
      tokenId2, {
        from: accounts[1],
      },
    );

    await secretSanta.sendPresent(
      nfts[0].address,
      tokenId2, {
        from: accounts[1],
      },
    );

    const owner = await nfts[0].ownerOf(tokenId2);
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

    const prize = await secretSanta.getPrize();

    await secretSanta.claimPrize(
      prize.tokens,
      prize.tokensId, {
        from: accounts[1],
      },
    );
  });

  it('Should send a prize, one present, and prevent a wrong user from claiming the prize', async () => {
    const tokenId = '0';

    await secretSanta.updateWhitelist(
      [nfts[0].address],
      true, {
        from: accounts[0],
      },
    );

    await nfts[0].getSantaNonFungibleToken(
      accounts[0],
      tokenId,
      '', {
        from: accounts[0],
      },
    );

    await nfts[0].approve(
      secretSanta.address,
      tokenId, {
        from: accounts[0],
      },
    );

    await secretSanta.sendPrize(
      [nfts[0].address],
      [tokenId], {
        from: accounts[0],
      },
    );

    const tokenId2 = '1';

    await nfts[0].getSantaNonFungibleToken(
      accounts[1],
      tokenId2,
      '', {
        from: accounts[1],
      },
    );

    await nfts[0].approve(
      secretSanta.address,
      tokenId2, {
        from: accounts[1],
      },
    );

    await secretSanta.sendPresent(
      nfts[0].address,
      tokenId2, {
        from: accounts[1],
      },
    );

    let lastPresentAt = await secretSanta.lastPresentAt();
    let prizeDelay = await secretSanta.prizeDelay();

    if (!utils.isBN(lastPresentAt)) {
      lastPresentAt = utils.toBN(lastPresentAt);
    }

    if (!utils.isBN(prizeDelay)) {
      prizeDelay = utils.toBN(prizeDelay);
    }

    await time.increaseTo(lastPresentAt.add(prizeDelay.add(prizeDelay)));

    const prize = await secretSanta.getPrize();

    await expectRevert(
      secretSanta.claimPrize(
        prize.tokens,
        prize.tokensId, {
          from: accounts[3],
        },
      ),
      'Sender not last Santa',
    );
  });

  it('Should send a prize, one present, and not claim the prize because it is too early', async () => {
    const tokenId = '0';

    await secretSanta.updateWhitelist(
      [nfts[0].address],
      true, {
        from: accounts[0],
      },
    );

    await nfts[0].getSantaNonFungibleToken(
      accounts[0],
      tokenId,
      '', {
        from: accounts[0],
      },
    );

    await nfts[0].approve(
      secretSanta.address,
      tokenId, {
        from: accounts[0],
      },
    );

    await secretSanta.sendPrize(
      [nfts[0].address],
      [tokenId], {
        from: accounts[0],
      },
    );

    const tokenId2 = '1';

    await nfts[0].getSantaNonFungibleToken(
      accounts[1],
      tokenId2,
      '', {
        from: accounts[1],
      },
    );

    await nfts[0].approve(
      secretSanta.address,
      tokenId2, {
        from: accounts[1],
      },
    );

    await secretSanta.sendPresent(
      nfts[0].address,
      tokenId2, {
        from: accounts[1],
      },
    );

    const prize = await secretSanta.getPrize();

    await expectRevert(
      secretSanta.claimPrize(
        prize.tokens,
        prize.tokensId, {
          from: accounts[1],
        },
      ),
      'Not yet',
    );
  });

  it('Should send a bunch of prizes, presents, and claim the prize', async () => {
    for (let i = 0; i < max; i += 1) {
      await secretSanta.updateWhitelist(
        [nfts[i].address],
        true, {
          from: accounts[0],
        },
      );
    }

    for (let i = 0; i < max; i += 1) {
      await nfts[i].getSantaNonFungibleToken(
        accounts[0],
        i,
        '', {
          from: accounts[0],
        },
      );
    }

    for (let i = 0; i < max; i += 1) {
      await nfts[i].approve(
        secretSanta.address,
        i, {
          from: accounts[0],
        },
      );
    }

    for (let i = 0; i < max; i += 1) {
      await secretSanta.sendPrize(
        [nfts[i].address],
        [i], {
          from: accounts[0],
        },
      );
    }

    for (let i = 0; i < 10; i += 1) {
      await nfts[i].getSantaNonFungibleToken(
        accounts[i],
        10 + i,
        '', {
          from: accounts[i],
        },
      );
    }

    for (let i = 0; i < 10; i += 1) {
      await nfts[i].approve(
        secretSanta.address,
        10 + i, {
          from: accounts[i],
        },
      );
    }

    for (let i = 0; i < 10; i += 1) {
      await secretSanta.sendPresent(
        nfts[i].address,
        10 + i, {
          from: accounts[i],
        },
      );
    }

    let lastPresentAt = await secretSanta.lastPresentAt();
    let prizeDelay = await secretSanta.prizeDelay();

    if (!utils.isBN(lastPresentAt)) {
      lastPresentAt = utils.toBN(lastPresentAt);
    }

    if (!utils.isBN(prizeDelay)) {
      prizeDelay = utils.toBN(prizeDelay);
    }

    await time.increaseTo(lastPresentAt.add(prizeDelay.add(prizeDelay)));

    const prize = await secretSanta.getPrize();

    await secretSanta.claimPrize(
      prize.tokens,
      prize.tokensId, {
        from: accounts[9],
      },
    );

    for (let i = 0; i < prize.tokens.length; i += 1) {
      const owner = await contractsByAddress[prize.tokens[i]].ownerOf(prize.tokensId[i]);

      assert.equal(owner, accounts[9], 'NFT owner is wrong');
    }
  });
});
