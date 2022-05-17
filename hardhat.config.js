require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("./tasks/init.js");
require("./tasks/bridge.js");

let { privateKey, kovanRpc, goerliRpc, kovanEtherscanApiKey } = require("./secrets.json");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
    ],
  },
  networks: {
    kovan: {
      url: kovanRpc,
      accounts: [privateKey]
    },
    goerli: {
      url: goerliRpc,
      accounts: [privateKey]
    }
  },
  etherscan: {
    apiKey: {
        kovan: kovanEtherscanApiKey
      }
    }
};