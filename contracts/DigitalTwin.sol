// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DigitalTwin
 * @dev An ERC721 token that represents a physical product's digital twin.
 * It tracks the product's lifecycle events and integrates with a rewards system.
 */
contract DigitalTwin is ERC721URIStorage, AccessControl {
    uint256 private _tokenIdCounter;

    // Roles for access control
    bytes32 public constant BRAND_ROLE = keccak256("BRAND_ROLE");
    bytes32 public constant RECYCLING_PARTNER_ROLE = keccak256("RECYCLING_PARTNER_ROLE");

    // Structure to store a lifecycle event
    struct ProductHistory {
        uint256 timestamp;
        string eventDescription;
        address actor;
    }

    // Mapping from a token ID to its lifecycle history
    mapping(uint256 => ProductHistory[]) public historyLog;

    // Mapping to track retired tokens
    mapping(uint256 => bool) public isRetired;

    // Event to be emitted when a new history item is logged
    event HistoryLogged(uint256 indexed tokenId, string eventDescription, address indexed actor);

    ERC20 public b3trToken;
    uint256 public rewardAmount;

    constructor(address _b3trTokenAddress) ERC721("ReLoop Digital Twin", "RELOOP") {
        _tokenIdCounter = 0;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRAND_ROLE, msg.sender); // The deployer is a brand by default
        _grantRole(RECYCLING_PARTNER_ROLE, msg.sender); // and a recycler for testing

        b3trToken = ERC20(_b3trTokenAddress);
        rewardAmount = 10 * 10**b3trToken.decimals(); // Default 10 B3TR reward
    }

    /**
     * @dev Mints a new Digital Twin NFT to the specified address.
     * Only callable by accounts with the BRAND_ROLE.
     * @param to The address to mint the token to.
     * @param uri The metadata URI for the token.
     * @return The ID of the newly minted token.
     */
    function safeMint(address to, string memory uri) public onlyRole(BRAND_ROLE) returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _logHistory(tokenId, "Minted", msg.sender);
        return tokenId;
    }

    /**
     * @dev Logs a new history event for a token.
     * Only callable by accounts with the BRAND_ROLE.
     * @param tokenId The ID of the token.
     * @param eventDescription The description of the event.
     */
    function logHistory(uint256 tokenId, string memory eventDescription) public onlyRole(BRAND_ROLE) {
        _logHistory(tokenId, eventDescription, msg.sender);
    }

    /**
     * @dev Internal function to log a history event for a token.
     * @param tokenId The ID of the token.
     * @param eventDescription The description of the event.
     * @param actor The address performing the action.
     */
    function _logHistory(uint256 tokenId, string memory eventDescription, address actor) internal {
        historyLog[tokenId].push(ProductHistory({
            timestamp: block.timestamp,
            eventDescription: eventDescription,
            actor: actor
        }));
        emit HistoryLogged(tokenId, eventDescription, actor);
    }

    /**
     * @dev Retires a product NFT after it has been recycled.
     * Transfers a B3TR token reward to the owner of the NFT.
     * Only callable by accounts with the RECYCLING_PARTNER_ROLE.
     * @param tokenId The ID of the token to retire.
     */
    function retire(uint256 tokenId) public onlyRole(RECYCLING_PARTNER_ROLE) {
        _retire(tokenId, msg.sender);
    }

    /**
     * @dev Internal function containing the core logic for retiring a product NFT.
     * @param tokenId The ID of the token to retire.
     * @param actor The address performing the retirement action (e.g., the recycler).
     */
    function _retire(uint256 tokenId, address actor) internal {
        address tokenOwner = ownerOf(tokenId);
        require(tokenOwner != address(0), "ERC721: owner query for nonexistent token");

        _logHistory(tokenId, "Recycled", actor);

        // Transfer the reward to the token owner
        require(b3trToken.balanceOf(address(this)) >= rewardAmount, "Contract has insufficient B3TR balance");

        b3trToken.transfer(tokenOwner, rewardAmount);

        // Lock the NFT to prevent future transfers
        isRetired[tokenId] = true;
    }

    /**
     * @dev Allows a Recycling Partner to retire a product, with an explicit sponsor.
     * This simulates fee delegation where a brand sponsors the transaction.
     * @param tokenId The ID of the token to retire.
     * @param sponsorAddress The address of the brand sponsoring this retirement.
     */
    function retireAndSponsor(uint256 tokenId, address sponsorAddress)
        public
        onlyRole(RECYCLING_PARTNER_ROLE)
    {
        require(hasRole(BRAND_ROLE, sponsorAddress), "DigitalTwin: Sponsor must have BRAND_ROLE");
        _logHistory(tokenId, string(abi.encodePacked("Sponsored by ", Strings.toHexString(sponsorAddress))), sponsorAddress); // Log the sponsorship event
        _retire(tokenId, msg.sender);
    }

    /**
     * @dev Returns the full history log for a given token ID.
     * @param tokenId The ID of the token.
     * @return An array of ProductHistory structs.
     */
    function getHistory(uint256 tokenId) public view returns (ProductHistory[] memory) {
        return historyLog[tokenId];
    }

    /**
     * @dev Overrides the token update hook to prevent transfers of retired tokens.
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        require(!(isRetired[tokenId] && from != address(0) && to != address(0)), "DigitalTwin: Retired tokens cannot be transferred");
        return super._update(to, tokenId, auth);
    }

    // The functions below support EIP-2981 royalty standard, which can be useful for the secondary market.
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
