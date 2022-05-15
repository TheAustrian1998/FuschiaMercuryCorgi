require("@nomiclabs/hardhat-waffle");
require("./tasks/init.js");

let { privateKey, kovanRpc, goerliRpc } = require("./secrets.json");

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
  }
};