//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "./Base.sol";

contract DestinationWithLiquidity is Base {

    bytes4 receiveNUnlock = bytes4(keccak256("receiveNUnlock(uint256,address)"));
    IERC20 public immutable token;

    constructor (IERC20 _token, IConnextHandler _connext, uint32 _thisContractDomain, uint32 _oppositeContractDomain) Base(_connext, _thisContractDomain, _oppositeContractDomain) {
        token = _token;
    }

    function availableLiquidity() public view returns (uint) {
        return token.balanceOf(address(this));
    }

    function _burnNSend(uint amount, address receiver) internal {
        require(amount > 0, "!amount");
        token.transferFrom(msg.sender, address(this), amount);

        bytes memory callData = abi.encodeWithSelector(receiveNUnlock, amount, receiver);

        initBridge(callData, oppositeContract, thisContractDomain, oppositeContractDomain, address(this));
    }

    function receiveNMint(uint amount, address receiver) public onlyExecutor {
        require(amount > 0, "!amount");
        require(availableLiquidity() >= amount, "!liquidity");
        token.transfer(receiver, amount);
    }

    function burnNSend(uint amount) public {
        _burnNSend(amount, msg.sender);
    }

    function burnNSend(uint amount, address receiver) public {
        _burnNSend(amount, receiver);
    }

}