const { expect } = require("chai");

describe("Test", function () {

    let thisContractDomain = 69;
    let oppositeContractDomain = 420;
    let tokenName = "Token";
    let tokenSymbol = "TKN";
    let oppositeContractAddress = ethers.Wallet.createRandom().address;
    let randomOriginSender = ethers.Wallet.createRandom().address;
    let randomDomain = 99;
    let toSend = ethers.utils.parseUnits("20");
    this.deployer;

    before(async function () {
        [this.deployer, this.randomReceiver] = await ethers.getSigners();

        //Deploy ERC20 Mock
        this.ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        this._ERC20Mock = await this.ERC20Mock.deploy();
        await this._ERC20Mock.deployed();

        //Deploy Connext Mock
        this.ConnextMock = await ethers.getContractFactory("ConnextMock");
        this.connextMock = await this.ConnextMock.deploy(oppositeContractAddress, oppositeContractDomain);
        await this.connextMock.deployed();

        //Deploy False Connext Mock
        this.FalseExecutorConnextMock = await ethers.getContractFactory("FalseExecutorConnextMock");
        this.falseExecutorConnextMock = await this.FalseExecutorConnextMock.deploy(oppositeContractAddress, oppositeContractDomain);
        await this.falseExecutorConnextMock.deployed();

        //Deploy SideWithLiquidity
        this.SideWithLiquidity = await ethers.getContractFactory("SideWithLiquidity");
        this.sideWithLiquidity = await this.SideWithLiquidity.deploy(this.connextMock.address, thisContractDomain, oppositeContractDomain, this._ERC20Mock.address);
        await this.sideWithLiquidity.deployed();

        //Deploy SideWithMint
        this.SideWithMint = await ethers.getContractFactory("SideWithMint");
        this.sideWithMint = await this.SideWithMint.deploy(this.connextMock.address, thisContractDomain, oppositeContractDomain, tokenName, tokenSymbol);
        await this.sideWithMint.deployed();
    });

    it("Should init on both...", async function () {
        // Init
        await this.sideWithLiquidity.init(oppositeContractAddress);
        await this.sideWithMint.init(oppositeContractAddress);

        // Try to init again, should fail
        await expect(this.sideWithLiquidity.init(oppositeContractAddress)).to.be.revertedWith("dont hack blz");
        await expect(this.sideWithMint.init(oppositeContractAddress)).to.be.revertedWith("dont hack blz");
    });

    it("Should receiveNUnlock in SideWithMint...", async function () {
        // simulate connext
        await this.connextMock.executeReceiveNUnlock(this.sideWithMint.address, toSend, this.randomReceiver.address);
        expect(await this.ERC20Mock.attach(this.sideWithMint.address).balanceOf(this.randomReceiver.address)).equal(toSend);

        // testing revert with !executor
        await expect(this.falseExecutorConnextMock.executeReceiveNUnlock(this.sideWithMint.address, toSend, this.randomReceiver.address)).to.be.revertedWith("!executor");

        // testing revert with !oppositeContractDomain
        await this.connextMock.changeOrigin(randomDomain);
        await expect(this.connextMock.executeReceiveNUnlock(this.sideWithMint.address, toSend, this.randomReceiver.address)).to.be.revertedWith("!oppositeContractDomain");
        await this.connextMock.changeOrigin(oppositeContractDomain);

        // testing revert with !oppositeContract
        await this.connextMock.changeOriginSender(randomOriginSender);
        await expect(this.connextMock.executeReceiveNUnlock(this.sideWithMint.address, toSend, this.randomReceiver.address)).to.be.revertedWith("!oppositeContract");
        await this.connextMock.changeOriginSender(oppositeContractAddress);
    });

    it("Should lockNSend in SideWithMint...", async function () {
        // send some tokens to deployer
        await this.ERC20Mock.attach(this.sideWithMint.address).connect(this.randomReceiver).transfer(this.deployer.address, toSend);

        // lock and send
        // await this.sideWithMint.lockNSend(ethers.utils.parseUnits("2"));
    });

    it("Should receiveNUnlock in SideWithLiquidity...", async function () {

    });

    it("Should lockNSend in SideWithLiquidity...", async function () {

    });

});