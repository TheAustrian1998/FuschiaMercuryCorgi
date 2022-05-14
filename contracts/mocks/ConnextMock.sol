//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import { IConnextHandler } from "@connext/nxtp-contracts/contracts/interfaces/IConnextHandler.sol";
import "hardhat/console.sol";

interface Side {
    function receiveNUnlock(uint amount, address receiver) external;
}

contract ConnextMock {

    address public executor;
    address public originSender;
    uint32 public origin;
    IConnextHandler.XCallArgs public data;

    constructor (address _originSender, uint32 _origin) {
        executor = address(this);
        originSender = _originSender;
        origin = _origin;
    }

    function changeOriginSender(address _originSender) public {
        originSender = _originSender;
    }

    function changeOrigin(uint32 _origin) public {
        origin = _origin;
    }

    function executeReceiveNUnlock(address side, uint amount, address receiver) public {
        Side(side).receiveNUnlock(amount, receiver);
    }

    function xcall(IConnextHandler.XCallArgs memory xcallArgs) external payable returns (bytes32) {
        data = xcallArgs;
        return bytes32("");
    }

}