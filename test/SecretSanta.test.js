/* eslint-env node, mocha */
/* global artifacts, contract, assert */

const {
  expectEvent,
  expectRevert,
  time,
} = require('@openzeppelin/test-helpers');
const utils = require('web3-utils');

const SecretSanta = artifacts.require('SecretSanta');
const SantaToken = artifacts.require('SantaToken');

contract('SecretSanta', (accounts) => {
  let secretSanta;
  let token;

  beforeEach(async () => {
    secretSanta = await SecretSanta.new();
    token = await SantaToken.new();
  });

  it('Should promise a present', async () => {
    const tokenId = '0';
    const salt = 'jasper';

    const promiseHash = utils.soliditySha3(
      {
        type: 'address',
        value: token.address,
      },
      {
        type: 'uint256',
        value: tokenId,
      },
      {
        type: 'bytes32',
        value: utils.soliditySha3(salt),
      },
    );

    const receipt = await secretSanta.promisePresent(promiseHash, {
      from: accounts[0],
    });

    expectEvent(receipt, 'NewPromisedPresent', {
      secretSanta: accounts[0],
      promiseHash,
    });
  });

  it('Should promise a present but not reveal it (Be patient)', async () => {
    const tokenId = '0';
    const salt = 'jasper';

    await token.getSantaToken(
      accounts[0],
      tokenId, {
        from: accounts[0],
      },
    );

    await token.approve(
      secretSanta.address,
      tokenId, {
        from: accounts[0],
      },
    );

    const promiseHash = utils.soliditySha3(
      {
        type: 'address',
        value: token.address,
      },
      {
        type: 'uint256',
        value: tokenId,
      },
      {
        type: 'bytes32',
        value: utils.soliditySha3(salt),
      },
    );

    await secretSanta.promisePresent(promiseHash, {
      from: accounts[0],
    });

    await expectRevert(
      secretSanta.revealPresent(
        token.address,
        tokenId,
        utils.soliditySha3(salt), {
          from: accounts[0],
        },
      ),
      'Be patien',
    );
  });

  it('Should promise a present and reveal it', async () => {
    const tokenId = '0';
    const salt = 'jasper';

    await token.getSantaToken(
      accounts[0],
      tokenId, {
        from: accounts[0],
      },
    );

    await token.approve(
      secretSanta.address,
      tokenId, {
        from: accounts[0],
      },
    );

    const promiseHash = utils.soliditySha3(
      {
        type: 'address',
        value: token.address,
      },
      {
        type: 'uint256',
        value: tokenId,
      },
      {
        type: 'bytes32',
        value: utils.soliditySha3(salt),
      },
    );

    await secretSanta.promisePresent(promiseHash, {
      from: accounts[0],
    });

    const expectedRevealPeriodStart = utils.toBN('1577145600');
    const revealPeriodStart = await secretSanta.revealPeriodStart();
    assert.ok(expectedRevealPeriodStart.eq(revealPeriodStart), 'Reveal period is wrong');

    await time.increaseTo(utils.toBN('1577191000'));

    const receipt = await secretSanta.revealPresent(
      token.address,
      tokenId,
      utils.soliditySha3(salt), {
        from: accounts[0],
      },
    );

    expectEvent(
      receipt,
      'PresentRevealed', {
        secretSanta: accounts[0],
        tokenContractAddress: token.address,
        tokenId,
      },
    );

    const owner = await token.ownerOf(tokenId);
    assert.equal(owner, secretSanta.address, 'NFT owner is wrong');
  });

  it('Should not promise a present (Too late)', async () => {
    const tokenId = '0';
    const salt = 'jasper';

    const promiseHash = utils.soliditySha3(
      {
        type: 'address',
        value: token.address,
      },
      {
        type: 'uint256',
        value: tokenId,
      },
      {
        type: 'bytes32',
        value: utils.soliditySha3(salt),
      },
    );

    await expectRevert(
      secretSanta.promisePresent(promiseHash, {
        from: accounts[0],
      }),
      'Too late',
    );
  });
});
