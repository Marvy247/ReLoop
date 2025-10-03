// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "src/DigitalTwin.sol";
import "src/B3TR.sol";

contract DigitalTwinTest is Test {
    DigitalTwin internal digitalTwin;
    B3TR internal b3tr;

    address internal brand = address(0x1);
    address internal user = address(0x2);
    address internal recycler = address(0x3);
    address internal deployer = address(this);

    function setUp() public {
        // Deploy B3TR token, deployer gets the initial supply
        vm.startPrank(deployer);
        b3tr = new B3TR(deployer);
        vm.stopPrank();

        // Deploy DigitalTwin contract, linking it to the B3TR token
        vm.startPrank(deployer);
        digitalTwin = new DigitalTwin(address(b3tr));
        vm.stopPrank();

        // Assign roles
        vm.startPrank(deployer);
        digitalTwin.grantRole(digitalTwin.BRAND_ROLE(), brand);
        digitalTwin.grantRole(digitalTwin.RECYCLING_PARTNER_ROLE(), recycler);
        vm.stopPrank();

        // Fund the DigitalTwin contract with B3TR tokens for rewards
        uint256 rewardFund = 1000 * 10**b3tr.decimals();
        vm.startPrank(deployer);
        b3tr.transfer(address(digitalTwin), rewardFund);
        vm.stopPrank();
    }

    function testMint() public {
        vm.startPrank(brand);
        uint256 tokenId = digitalTwin.safeMint(user, "ipfs://my-token-uri");
        vm.stopPrank();

        assertEq(digitalTwin.ownerOf(tokenId), user);
        assertEq(digitalTwin.tokenURI(tokenId), "ipfs://my-token-uri");

        // Check history log
        DigitalTwin.ProductHistory[] memory history = digitalTwin.getHistory(tokenId);
        assertEq(history.length, 1);
        assertEq(history[0].eventDescription, "Minted");
        assertEq(history[0].actor, brand);
    }

    function testRetire() public {
        // 1. Mint a token to the user
        vm.startPrank(brand);
        uint256 tokenId = digitalTwin.safeMint(user, "ipfs://my-token-uri");
        vm.stopPrank();

        // 2. Attempt to retire from an unauthorized account (should fail)
        vm.startPrank(user);
        vm.expectRevert(); // Expects a revert due to AccessControl
        digitalTwin.retire(tokenId);
        vm.stopPrank();

        // 3. Retire from an authorized recycler account
        uint256 userBalanceBefore = b3tr.balanceOf(user);
        uint256 rewardAmount = digitalTwin.rewardAmount();

        vm.startPrank(recycler);
        digitalTwin.retire(tokenId);
        vm.stopPrank();

        // 4. Check user's B3TR balance
        uint256 userBalanceAfter = b3tr.balanceOf(user);
        assertEq(userBalanceAfter, userBalanceBefore + rewardAmount);

        // 5. Check history log
        DigitalTwin.ProductHistory[] memory history = digitalTwin.getHistory(tokenId);
        assertEq(history.length, 2);
        assertEq(history[1].eventDescription, "Recycled");
        assertEq(history[1].actor, recycler);

        // 6. Check token is retired
        assertEq(digitalTwin.isRetired(tokenId), true);
    }

    function testLogHistory() public {
        vm.startPrank(brand);
        uint256 tokenId = digitalTwin.safeMint(user, "ipfs://my-token-uri");
        vm.stopPrank();

        vm.startPrank(brand);
        digitalTwin.logHistory(tokenId, "Repaired");
        vm.stopPrank();

        DigitalTwin.ProductHistory[] memory history = digitalTwin.getHistory(tokenId);
        assertEq(history.length, 2);
        assertEq(history[1].eventDescription, "Repaired");
        assertEq(history[1].actor, brand);
    }

    function testRetiredCannotTransfer() public {
        vm.startPrank(brand);
        uint256 tokenId = digitalTwin.safeMint(user, "ipfs://my-token-uri");
        vm.stopPrank();

        vm.startPrank(recycler);
        digitalTwin.retire(tokenId);
        vm.stopPrank();

        vm.startPrank(user);
        vm.expectRevert("DigitalTwin: Retired tokens cannot be transferred");
        digitalTwin.transferFrom(user, address(0x4), tokenId);
        vm.stopPrank();
    }
}
