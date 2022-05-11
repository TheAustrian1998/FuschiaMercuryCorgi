//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

interface Side {
    function receiveNUnlock(uint amount, address receiver) external;
}

contract ConnextMock {

    address public executor;
    address public originSender;
    uint32 public origin;
    constructor (address _originSender, uint32 _origin) {
        executor = address(this);
        originSender = _originSender;
        origin = _origin;
    }

    function executeReceiveNUnlock(address side, uint amount, address receiver) public {
        Side(side).receiveNUnlock(amount, receiver);
    }

}