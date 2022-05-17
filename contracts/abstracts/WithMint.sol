//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "./Base.sol";

abstract contract WithMint is Base, ERC20 {

    constructor (string memory _name, string memory _symbol) ERC20(_name, _symbol) { }

    function _lockNSend(uint amount, address receiver) internal override {
        require(amount > 0, "!amount");
        _burn(msg.sender, amount);

        bytes memory callData = abi.encodeWithSelector(receiveNUnlockSelector, amount, receiver);

        initBridge(callData, oppositeContract, thisContractDomain, oppositeContractDomain);
        emit LockedNSend(amount, receiver);
    }

    function receiveNUnlock(uint amount, address receiver) public override onlyExecutor {
        require(amount > 0, "!amount");
        _mint(receiver, amount);
        emit ReceivedNUnlocked(amount, receiver);
    }

}