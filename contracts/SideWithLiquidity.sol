//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "./abstracts/WithLiquidity.sol";

contract SideWithLiquidity is WithLiquidity {
    
    constructor (
        IConnextHandler _connext, 
        uint32 _thisContractDomain, 
        uint32 _oppositeContractDomain,
        IERC20 _tokenFee,
        IERC20 _token
    ) Base (
        _connext, 
        _thisContractDomain, 
        _oppositeContractDomain,
        _tokenFee
    ) WithLiquidity (
        _token
    ) { }

}