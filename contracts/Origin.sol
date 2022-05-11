//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "./Base.sol";

contract Origin is Base {

    bytes4 receiveNMint = bytes4(keccak256("receiveNMint(uint256,address)"));
    IERC20 public immutable token;

    constructor (IERC20 _token, IConnextHandler _connext, uint32 _thisContractDomain, uint32 _oppositeContractDomain) Base(_connext, _thisContractDomain, _oppositeContractDomain) {
        token = _token;
    }

    function _lockNSend(uint amount, address receiver) internal {
        require(amount > 0, "!amount");
        token.transferFrom(msg.sender, address(this), amount);

        bytes memory callData = abi.encodeWithSelector(receiveNMint, amount, receiver);

        initBridge(callData, oppositeContract, thisContractDomain, oppositeContractDomain, address(token));
    }

    function lockNSend(uint amount) public {
        _lockNSend(amount, msg.sender);
    }

    function lockNSend(uint amount, address receiver) public {
        _lockNSend(amount, receiver);
    }

    function receiveNUnlock(uint amount, address receiver) public onlyExecutor {
        require(amount > 0, "!amount");
        token.transfer(receiver, amount);
    }

}