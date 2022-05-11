//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "./Base.sol";

abstract contract WithLiquidity is Base {

    IERC20 public immutable token;

    constructor (IERC20 _token) {
        token = _token;
    }

    function _lockNSend(uint amount, address receiver) internal override {
        require(amount > 0, "!amount");
        token.transferFrom(msg.sender, address(this), amount);

        bytes memory callData = abi.encodeWithSelector(receiveNUnlockSelector, amount, receiver);

        initBridge(callData, oppositeContract, thisContractDomain, oppositeContractDomain, address(token));
    }

    function receiveNUnlock(uint amount, address receiver) public override onlyExecutor {
        require(amount > 0, "!amount");
        token.transfer(receiver, amount);
    }

    function availableLiquidity() public view returns (uint) {
        return token.balanceOf(address(this));
    }
}