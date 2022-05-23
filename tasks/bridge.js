const { task } = require("hardhat/config");

task("bridge", "bridge...")
    .addParam("side", "side address")
    .addParam("amount", "amount (in human)")
    .addParam("relayerfee", "fee to relayer (in tesnets is zero)")
    .addOptionalParam("token", "token address")
    .addOptionalParam("receiver", "receiver address")
    .setAction(async (taskArgs) => {
        [this.deployer] = await ethers.getSigners();

        this.Side = await ethers.getContractFactory("SideWithLiquidity");
        this.ERC20 = await ethers.getContractFactory("ERC20Mock");

        let amountToSend = ethers.utils.parseUnits(String(taskArgs.amount));
        let relayerFee = taskArgs.relayerfee;

        let lockNSendWithAmount = new ethers.Contract(taskArgs.side, [
            'function lockNSend(uint amount, uint relayerFee) external'
        ], this.deployer);

        let lockNSendWithReceiver = new ethers.Contract(taskArgs.side, [
            'function lockNSend(uint amount, address receiver, uint relayerFee) external'
        ], this.deployer);

        let allowance = await this.ERC20.attach(taskArgs.token).allowance(this.deployer.address, taskArgs.side);

        if (taskArgs.token != null && taskArgs.token != undefined && taskArgs.token && allowance < amountToSend) {
            let approveTx = await this.ERC20.attach(taskArgs.token).approve(taskArgs.side, ethers.constants.MaxUint256);
            console.log(approveTx);
        }

        let tx;
        if (taskArgs.receiver != null && taskArgs.receiver != undefined && taskArgs.receiver) {
            // optional parm send
            tx = await lockNSendWithReceiver.lockNSend(amountToSend, receiver, relayerFee, {
                gasLimit: 1000000
            });
        } else {
            // parm not send
            tx = await lockNSendWithAmount.lockNSend(amountToSend, relayerFee, {
                gasLimit: 1000000
            });
        }

        console.log("Tx sended: ", tx.hash);
    });