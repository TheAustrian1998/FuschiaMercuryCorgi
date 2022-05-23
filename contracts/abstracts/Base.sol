//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import { IConnextHandler } from "@connext/nxtp-contracts/contracts/interfaces/IConnextHandler.sol";
import { IExecutor } from "@connext/nxtp-contracts/contracts/interfaces/IExecutor.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

abstract contract Base is Ownable, Pausable {

    IConnextHandler public immutable connext;
    address public executor; // address of connext executor
    address public tokenFee; // token to pay relayer fees

    uint32 public thisContractDomain; // this contract chain
    uint32 public oppositeContractDomain; // receiver contract chain

    address public oppositeContract; // address of opposite contract

    bytes4 receiveNUnlockSelector = this.receiveNUnlock.selector; //bytes4(keccak256("receiveNUnlock(uint256,address)"));

    bool isInitialized = false;

    event Initialized(address oppositeContract);
    event ReceivedNUnlocked(uint amount, address receiver);
    event LockedNSend(uint amount, address receiver);

    constructor(IConnextHandler _connext, uint32 _thisContractDomain, uint32 _oppositeContractDomain, address _tokenFee) {
        connext = _connext;
        thisContractDomain = _thisContractDomain;
        oppositeContractDomain = _oppositeContractDomain;
        executor = _connext.getExecutor();
        tokenFee = _tokenFee;
    }

    modifier onlyExecutor() {
        require(IExecutor(msg.sender).originSender() == oppositeContract, "!oppositeContract");
        require(IExecutor(msg.sender).origin() == oppositeContractDomain, "!oppositeContractDomain");
        require(msg.sender == executor, "!executor");
        _;
    }

    function initBridge(bytes memory callData, address to, uint32 originDomain, uint32 destinationDomain, uint relayerFee) internal whenNotPaused {
        IConnextHandler.CallParams memory callParams = IConnextHandler.CallParams({
            to: to,
            callData: callData,
            originDomain: originDomain,
            destinationDomain: destinationDomain,
            forceSlow: true,
            receiveLocal: false
        });

        IConnextHandler.XCallArgs memory xcallArgs = IConnextHandler.XCallArgs({
            params: callParams,
            transactingAssetId: tokenFee,
            amount: 0,
            relayerFee: relayerFee
        });

        connext.xcall(xcallArgs);
    }

    function init(address _oppositeContract) public onlyOwner {
        require(!isInitialized, "dont hack blz");
        oppositeContract = _oppositeContract;
        isInitialized = true;
        emit Initialized(_oppositeContract);
    }

    function receiveNUnlock(uint amount, address receiver) public virtual onlyExecutor { }

    function _lockNSend(uint amount, address receiver, uint relayerFee) internal virtual { }

    function lockNSend(uint amount, uint relayerFee) public whenNotPaused { 
        _lockNSend(amount, msg.sender, relayerFee);
    }

    function lockNSend(uint amount, address receiver, uint relayerFee) public whenNotPaused {
        _lockNSend(amount, receiver, relayerFee);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

}