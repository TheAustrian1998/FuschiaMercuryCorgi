//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import { IConnextHandler } from "@connext/nxtp-contracts/contracts/interfaces/IConnextHandler.sol";
import { IExecutor } from "@connext/nxtp-contracts/contracts/interfaces/IExecutor.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Origin {

    IConnextHandler public immutable connext;
    address public destinationContract;
    IERC20 public immutable token;

    uint32 public originDomain; // this contract chain (Origin.sol)
    uint32 public destinationDomain; // receiver contract chain (Destination.sol)

    bytes4 receiveNMint = bytes4(keccak256("receiveNMint(uint256,address)"));

    constructor(IConnextHandler _connext, IERC20 _token, uint32 _originDomain, uint32 _destinationDomain) {
        connext = _connext;
        originDomain = _originDomain;
        destinationDomain = _destinationDomain;
        token = _token;
    }

    function lockNSend(uint amount) public {
        require(amount > 0, "!amount");
        token.transferFrom(msg.sender, address(this), amount);

        bytes memory callData = abi.encodeWithSelector(receiveNMint, amount, msg.sender);

        IConnextHandler.CallParams memory callParams = IConnextHandler.CallParams({
            to: destinationContract,
            callData: callData,
            originDomain: originDomain,
            destinationDomain: destinationDomain
        });

        IConnextHandler.XCallArgs memory xcallArgs = IConnextHandler.XCallArgs({
            params: callParams,
            transactingAssetId: address(token),
            amount: 0,
            relayerFee: 0
        });

        connext.xcall(xcallArgs);
    }

    function receiveNUnlock(uint amount, address receiver) public {
        // origin domain of the source contract
        require(IExecutor(msg.sender).origin() == destinationDomain, "!destinationDomain");
        // msg.sender of xcall from the origin domain
        require(IExecutor(msg.sender).originSender() == destinationContract, "!destinationContract");
        require(amount > 0, "!amount");
        token.transfer(receiver, amount);
    }

}