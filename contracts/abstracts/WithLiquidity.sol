//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "./Base.sol";

abstract contract WithLiquidity is Base {

    IERC20 public immutable token;

    event AddedLiquidity(uint amount);
    event RemovedLiquidity(uint amount);

    constructor (IERC20 _token) {
        token = _token;
    }

    function _lockNSend(uint amount, address receiver, uint relayerFee) internal override {
        require(amount > 0, "!amount");
        token.transferFrom(msg.sender, address(this), amount);

        bytes memory callData = abi.encodeWithSelector(receiveNUnlockSelector, amount, receiver);

        initBridge(callData, oppositeContract, thisContractDomain, oppositeContractDomain, relayerFee);
        emit LockedNSend(amount, receiver);
    }

    function receiveNUnlock(uint amount, address receiver) public override onlyExecutor {
        require(amount > 0, "!amount");
        require(availableLiquidity() >= amount, "!liquidity");
        token.transfer(receiver, amount);
        emit ReceivedNUnlocked(amount, receiver);
    }

    function availableLiquidity() public view returns (uint) {
        return token.balanceOf(address(this));
    }

    function addLiquidity(uint amount) public onlyOwner {
        token.transferFrom(msg.sender, address(this), amount);
        emit AddedLiquidity(amount);
    }

    function removeLiquidity(uint amount) public onlyOwner {
        token.transfer(msg.sender, amount);
        emit RemovedLiquidity(amount);
    }
    
}