//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {

    constructor () ERC20("MyMock", "MKC"){
        _mint(msg.sender, 21000000 ether);
    }

}