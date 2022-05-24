const { expect } = require("chai");

describe("Test", function () {

    let thisContractDomain = 69;
    let oppositeContractDomain = 420;
    let tokenName = "Token";
    let tokenSymbol = "TKN";
    let oppositeContractAddress = ethers.Wallet.createRandom().address;
    let randomOriginSender = ethers.Wallet.createRandom().address;
    let receiver = ethers.Wallet.createRandom().address;
    let randomDomain = 99;
    let toSend = ethers.utils.parseUnits("20");
    this.deployer;

    before(async function () {
        [this.deployer, this.randomReceiver] = await ethers.getSigners();

        //Deploy ERC20 Mock
        this.ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        this._token = await this.ERC20Mock.deploy();
        await this._token.deployed();

        //Deploy ERC20 fee Mock
        this.ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        this._tokenFee = await this.ERC20Mock.deploy();
        await this._tokenFee.deployed();

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
        this.sideWithLiquidity = await this.SideWithLiquidity.deploy(this.connextMock.address, thisContractDomain, oppositeContractDomain, this._tokenFee.address, this._token.address);
        await this.sideWithLiquidity.deployed();

        //Deploy SideWithMint
        this.SideWithMint = await ethers.getContractFactory("SideWithMint");
        this.sideWithMint = await this.SideWithMint.deploy(this.connextMock.address, thisContractDomain, oppositeContractDomain, this._tokenFee.address, tokenName, tokenSymbol);
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

        // testing revert with !amount
        await expect(this.connextMock.executeReceiveNUnlock(this.sideWithMint.address, 0, this.randomReceiver.address)).to.be.revertedWith("!amount");

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
        let toLockNSend = ethers.utils.parseUnits("2");
        let balanceBefore = 0;

        // send some tokens to deployer
        await this.ERC20Mock.attach(this.sideWithMint.address).connect(this.randomReceiver).transfer(this.deployer.address, toSend);

        // lock and send
        balanceBefore = await this.ERC20Mock.attach(this.sideWithMint.address).connect(this.deployer).balanceOf(this.deployer.address);
        await this.sideWithMint['lockNSend(uint256,uint256)'](toLockNSend, 0);
        expect(Number(await this.ERC20Mock.attach(this.sideWithMint.address).connect(this.deployer).balanceOf(this.deployer.address))).equal(Number(balanceBefore) - Number(toLockNSend));

        balanceBefore = await this.ERC20Mock.attach(this.sideWithMint.address).connect(this.deployer).balanceOf(this.deployer.address);
        await this.sideWithMint['lockNSend(uint256,address,uint256)'](toLockNSend, receiver, 0);
        expect(Number(await this.ERC20Mock.attach(this.sideWithMint.address).connect(this.deployer).balanceOf(this.deployer.address))).equal(Number(balanceBefore) - Number(toLockNSend));
        
        // test revert with !amount
        await expect(this.sideWithMint['lockNSend(uint256,address,uint256)'](0, receiver, 0)).to.be.revertedWith("!amount");
    });

    it("Should receiveNUnlock in SideWithLiquidity...", async function () {
        // testing revert with !liquidity
        await expect(this.connextMock.executeReceiveNUnlock(this.sideWithLiquidity.address, 100, this.randomReceiver.address)).to.be.revertedWith("!liquidity");

        // add liquidity
        await this._token.mint(this.sideWithLiquidity.address, ethers.utils.parseUnits("200"));

        // simulate connext
        await this.connextMock.executeReceiveNUnlock(this.sideWithLiquidity.address, toSend, this.randomReceiver.address);
        expect(await this._token.balanceOf(this.randomReceiver.address)).equal(toSend);

        // testing revert with !amount
        await expect(this.connextMock.executeReceiveNUnlock(this.sideWithLiquidity.address, 0, this.randomReceiver.address)).to.be.revertedWith("!amount");

        // testing revert with !executor
        await expect(this.falseExecutorConnextMock.executeReceiveNUnlock(this.sideWithLiquidity.address, toSend, this.randomReceiver.address)).to.be.revertedWith("!executor");

        // testing revert with !oppositeContractDomain
        await this.connextMock.changeOrigin(randomDomain);
        await expect(this.connextMock.executeReceiveNUnlock(this.sideWithLiquidity.address, toSend, this.randomReceiver.address)).to.be.revertedWith("!oppositeContractDomain");
        await this.connextMock.changeOrigin(oppositeContractDomain);

        // testing revert with !oppositeContract
        await this.connextMock.changeOriginSender(randomOriginSender);
        await expect(this.connextMock.executeReceiveNUnlock(this.sideWithLiquidity.address, toSend, this.randomReceiver.address)).to.be.revertedWith("!oppositeContract");
        await this.connextMock.changeOriginSender(oppositeContractAddress);
    });

    it("Should lockNSend in SideWithLiquidity...", async function () {
        let toLockNSend = ethers.utils.parseUnits("2");
        let balanceBefore = 0;
        
        // approve
        await this._token.approve(this.sideWithLiquidity.address, ethers.constants.MaxUint256);
        
        // lock and send
        balanceBefore = await this._token.balanceOf(this.deployer.address);
        await this.sideWithLiquidity['lockNSend(uint256,uint256)'](toLockNSend, 0);
        expect(Number(await this._token.balanceOf(this.deployer.address))).equal(Number(balanceBefore) - Number(toLockNSend));

        balanceBefore = await this._token.balanceOf(this.deployer.address);
        await this.sideWithLiquidity['lockNSend(uint256,address,uint256)'](toLockNSend, receiver, 0);
        expect(Number(await this._token.balanceOf(this.deployer.address))).equal(Number(balanceBefore) - Number(toLockNSend));
        
        // test revert with !amount
        await expect(this.sideWithLiquidity['lockNSend(uint256,address,uint256)'](0, receiver, 0)).to.be.revertedWith("!amount");
    });

});