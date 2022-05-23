const { task } = require("hardhat/config");

task("mint", "mint test token...")
    .addParam("token", "token address")
    .addParam("receiver", "receiver address")
    .setAction(async (taskArgs) => {
        this.ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        let tx = await this.ERC20Mock.attach(taskArgs.token).mint(taskArgs.receiver, ethers.utils.parseUnits("10000"));

        console.log("Tx sended: ", tx.hash);
    });