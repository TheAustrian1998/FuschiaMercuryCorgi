const hre = require("hardhat");
const {
    ConnextHandlerGoerli,
    GoerliDomain,
    KovanDomain,
    TokenFeeGoerli,
    TestTokenGoerli
} = require("../registry.json");

async function main() {

    await hre.run("clean");
    await hre.run("compile");

    this.SideWithLiquidity = await ethers.getContractFactory("SideWithLiquidity");
    this.sideWithLiquidity = await this.SideWithLiquidity.deploy(ConnextHandlerGoerli, GoerliDomain, KovanDomain, TokenFeeGoerli, TestTokenGoerli);
    await this.sideWithLiquidity.deployed();
    
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });