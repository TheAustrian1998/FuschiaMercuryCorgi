//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "./Base.sol";

contract DestinationWithMint is Base, ERC20 {

    bytes4 receiveNUnlock = bytes4(keccak256("receiveNUnlock(uint256,address)"));

    constructor (IConnextHandler _connext, uint32 _thisContractDomain, uint32 _oppositeContractDomain) Base(_connext, _thisContractDomain, _oppositeContractDomain) ERC20("", "") { }

    function _burnNSend(uint amount, address receiver) internal {
        require(amount > 0, "!amount");
        _burn(msg.sender, amount);

        bytes memory callData = abi.encodeWithSelector(receiveNUnlock, amount, receiver);

        initBridge(callData, oppositeContract, thisContractDomain, oppositeContractDomain, address(this));
    }

    function receiveNMint(uint amount, address receiver) public onlyExecutor {
        require(amount > 0, "!amount");
        _mint(receiver, amount);
    }

    function burnNSend(uint amount) public {
        _burnNSend(amount, msg.sender);
    }

    function burnNSend(uint amount, address receiver) public {
        _burnNSend(amount, receiver);
    }

}