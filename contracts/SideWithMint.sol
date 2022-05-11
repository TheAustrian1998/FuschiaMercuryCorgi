//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "./abstracts/WithMint.sol";

contract SideWithMint is WithMint {

    constructor (
        IConnextHandler _connext, 
        uint32 _thisContractDomain, 
        uint32 _oppositeContractDomain, 
        string memory _name, 
        string memory _symbol
    ) Base (
        _connext, 
        _thisContractDomain,
        _oppositeContractDomain
    ) WithMint (
        _name, 
        _symbol
    ) { }

}