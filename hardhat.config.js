require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("./tasks/init.js");
require("./tasks/bridge.js");
require("./tasks/mint.js");

let { 
  privateKey, 
  kovanRpc, 
  goerliRpc, 
  rinkebyRpc, 
  kovanEtherscanApiKey 
} = require("./secrets.json");

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
    },
    rinkeby: {
      url: rinkebyRpc,
      accounts: [privateKey]
    }
  },
  etherscan: {
    apiKey: {
      kovan: kovanEtherscanApiKey
    }
  },
  gasReporter: {
    excludeContracts: ["/mocks/", "ERC20"]
  }
};