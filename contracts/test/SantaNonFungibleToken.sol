pragma solidity 0.5.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract SantaNonFungibleToken is ERC721 {
    constructor() public ERC721() {
    }

    function getSantaNonFungibleToken(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}
