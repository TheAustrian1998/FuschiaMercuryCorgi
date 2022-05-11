//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import { IConnextHandler } from "@connext/nxtp-contracts/contracts/interfaces/IConnextHandler.sol";
import { IExecutor } from "@connext/nxtp-contracts/contracts/interfaces/IExecutor.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IConnextHandlerAux.sol";

abstract contract Base {

    IConnextHandler public immutable connext;
    address public executor; // address of connext executor

    uint32 public thisContractDomain; // this contract chain
    uint32 public oppositeContractDomain; // receiver contract chain

    address public oppositeContract; // address of opposite contract

    constructor(IConnextHandler _connext, uint32 _thisContractDomain, uint32 _oppositeContractDomain) {
        connext = _connext;
        thisContractDomain = _thisContractDomain;
        oppositeContractDomain = _oppositeContractDomain;
        executor = address(IConnextHandlerAux(address(_connext)).executor());
    }

    modifier onlyExecutor() {
        require(
            IExecutor(msg.sender).originSender() == oppositeContract && 
            IExecutor(msg.sender).origin() == oppositeContractDomain && 
            msg.sender == executor,
            "!auth"
        );
        _;
    }

    function initBridge(bytes memory callData, address to, uint32 originDomain, uint32 destinationDomain, address transactingAssetId) internal {
        IConnextHandler.CallParams memory callParams = IConnextHandler.CallParams({
            to: to,
            callData: callData,
            originDomain: originDomain,
            destinationDomain: destinationDomain
        });

        IConnextHandler.XCallArgs memory xcallArgs = IConnextHandler.XCallArgs({
            params: callParams,
            transactingAssetId: transactingAssetId,
            amount: 0,
            relayerFee: 0
        });

        connext.xcall(xcallArgs);
    }

}