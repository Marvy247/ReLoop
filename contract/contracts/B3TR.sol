// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title B3TR
 * @dev A mock ERC20 token for hackathon rewards.
 */
contract B3TR is ERC20 {
    constructor(address initialOwner) ERC20("Best 3arth Token", "B3TR") {
        // Mint 1 million tokens to the contract deployer
        _mint(initialOwner, 1_000_000 * 10**decimals());
    }
}
