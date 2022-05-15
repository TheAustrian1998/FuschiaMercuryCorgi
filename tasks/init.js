const { task } = require("hardhat/config");

task("init", "init...")
    .addParam("side", "side address")
    .addParam("oppositeContract", "opposite contract address")
    .setAction(async (taskArgs) => {
        this.Side = await ethers.getContractFactory("SideWithLiquidity");
        await this.Side.attach(taskArgs.side).init(taskArgs.oppositeContract);
    });