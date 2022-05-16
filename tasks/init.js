const { task } = require("hardhat/config");

task("init", "init...")
    .addParam("side", "side address")
    .addParam("oppositecontract", "opposite contract address")
    .setAction(async (taskArgs) => {
        this.Side = await ethers.getContractFactory("SideWithLiquidity");
        let tx = await this.Side.attach(taskArgs.side).init(taskArgs.oppositecontract);

        console.log(tx);
    });