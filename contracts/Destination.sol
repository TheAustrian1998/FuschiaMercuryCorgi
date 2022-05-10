//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import { IConnextHandler } from "@connext/nxtp-contracts/contracts/interfaces/IConnextHandler.sol";
import { IExecutor } from "@connext/nxtp-contracts/contracts/interfaces/IExecutor.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Destination is ERC20 {

    IConnextHandler public immutable connext;
    address public originContract;

    uint32 public originDomain; // receiver contract chain (Origin.sol)
    uint32 public destinationDomain; // this contract chain (Destination.sol)

    bytes4 receiveNUnlock = bytes4(keccak256("receiveNUnlock(uint256,address)"));

    constructor(IConnextHandler _connext, uint32 _originDomain, uint32 _destinationDomain) ERC20("", "") {
        connext = _connext;
        originDomain = _originDomain;
        destinationDomain = _destinationDomain;
    }

    function receiveNMint(uint amount, address receiver) public {
        // origin domain of the source contract
        require(IExecutor(msg.sender).origin() == originDomain, "!originDomain");
        // msg.sender of xcall from the origin domain
        require(IExecutor(msg.sender).originSender() == originContract, "!originContract");
        require(amount > 0, "!amount");
        _mint(receiver, amount);
    }

    function burnNSend(uint amount) public {
        require(amount > 0, "!amount");
        _burn(msg.sender, amount);

        bytes memory callData = abi.encodeWithSelector(receiveNUnlock, amount, msg.sender);

        IConnextHandler.CallParams memory callParams = IConnextHandler.CallParams({
            to: originContract,
            callData: callData,
            originDomain: destinationDomain,
            destinationDomain: originDomain
        });

        IConnextHandler.XCallArgs memory xcallArgs = IConnextHandler.XCallArgs({
            params: callParams,
            transactingAssetId: address(this),
            amount: 0,
            relayerFee: 0
        });

        connext.xcall(xcallArgs);
    }

}