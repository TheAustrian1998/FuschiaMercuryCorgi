const hre = require("hardhat");
const {
    ConnextHandlerRinkeby,
    RinkebyDomain,
    KovanDomain,
    TokenFeeRinkeby,
    TestTokenRinkeby
} = require("../registry.json");

async function main() {

    await hre.run("clean");
    await hre.run("compile");

    this.SideWithLiquidity = await ethers.getContractFactory("SideWithLiquidity");
    this.sideWithLiquidity = await this.SideWithLiquidity.deploy(ConnextHandlerRinkeby, RinkebyDomain, KovanDomain, TokenFeeRinkeby, TestTokenRinkeby);
    await this.sideWithLiquidity.deployed();
    
    console.log("Deployed at: ", this.sideWithLiquidity.address);
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });