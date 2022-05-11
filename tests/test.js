const { expect } = require("chai");

describe("Test", function () {

    let thisContractDomain = 69;
    let oppositeContractDomain = 420;
    let tokenName = "Token";
    let tokenSymbol = "TKN";
    let oppositeContractAddress = ethers.Wallet.createRandom().address;
    let randomReceiver = ethers.Wallet.createRandom().address;
    this.deployer;

    before(async function () {
        [this.deployer] = await ethers.getSigners();

        //Deploy ERC20 Mock
        this.ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        this._ERC20Mock = await this.ERC20Mock.deploy();
        await this._ERC20Mock.deployed();

        //Deploy Mock
        this.ConnextMock = await ethers.getContractFactory("ConnextMock");
        this.connextMock = await this.ConnextMock.deploy(oppositeContractAddress, oppositeContractDomain);
        await this.connextMock.deployed();

        //Deploy
        this.SideWithLiquidity = await ethers.getContractFactory("SideWithLiquidity");
        this.sideWithLiquidity = await this.SideWithLiquidity.deploy(this.connextMock.address, thisContractDomain, oppositeContractDomain, this._ERC20Mock.address);
        await this.sideWithLiquidity.deployed();

        //Deploy
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
        let toSend = ethers.utils.parseUnits("20");
        await this.connextMock.executeReceiveNUnlock(this.sideWithMint.address, toSend, randomReceiver);
        expect(await this.ERC20Mock.attach(this.sideWithMint.address).balanceOf(randomReceiver)).equal(toSend);

        // reverts
        
    });

    it("Should lockNSend in SideWithMint...", async function () {

    });

    it("Should receiveNUnlock in SideWithLiquidity...", async function () {

    });

    it("Should lockNSend in SideWithLiquidity...", async function () {

    });

});