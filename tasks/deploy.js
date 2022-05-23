const { task } = require("hardhat/config");

task("deploy", "deploy...")
    .addParam("iswithmint", "boolean: TRUE for mint, FALSE for liquidity")
    .addParam("handler", "connext handler address")
    .addParam("thiscontractdomain", "chain domain from this contract")
    .addParam("oppositecontractdomain", "chain domain from opposite contract")
    .addOptionalParam("token", "token address (only required in liquidity mode)")
    .addParam("tokenfee", "token address to pay fees")
    .addOptionalParam("name", "token name")
    .addOptionalParam("symbol", "token symbol")
    .setAction(async (taskArgs) => {
        let contract;

        if (taskArgs.iswithmint == true) {
            contract = await ethers.getContractFactory("SideWithLiquidity");
            contract = await contract.deploy(taskArgs.handler, taskArgs.thiscontractdomain, taskArgs.oppositecontractdomain, taskArgs.tokenfee, taskArgs.token);
        } else {
            contract = await ethers.getContractFactory("SideWithMint");
            contract = await contract.deploy(taskArgs.handler, taskArgs.thiscontractdomain, taskArgs.oppositecontractdomain, taskArgs.tokenfee, taskArgs.name, taskArgs.symbol);
        }

        await contract.deployed();
        
        console.log("Deployed at: ", contract.address);
    });