require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');
const Utils = require('web3-utils');

const mainnetUrl = `https://mainnet.infura.io/v3/${process.env.INFURA}`;
const rinkebyUrl = `https://rinkeby.infura.io/v3/${process.env.INFURA}`;

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: 4000000,
      gasPrice: Utils.toWei('2', 'gwei'),
    },
    rinkeby: {
      provider() {
        return new HDWalletProvider(process.env.MNEMONIC, rinkebyUrl, 0);
      },
      network_id: 4,
      gasPrice: Utils.toWei('2', 'gwei'),
      gas: 7000000,
    },
    live: {
      provider() {
        return new HDWalletProvider(process.env.MNEMONIC, mainnetUrl, 0);
      },
      network_id: 1,
      gasPrice: Utils.toWei('2', 'gwei'),
      gas: 8000000,
    },
  },
  mocha: {
    useColors: true,
  },
  compilers: {
    solc: {
      version: '0.5.13',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
