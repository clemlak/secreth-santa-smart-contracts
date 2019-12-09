pragma solidity 0.5.13;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";


contract SantaNonFungibleToken is ERC721Full {
    constructor(
        string memory name,
        string memory symbol
    ) public ERC721Full(
        name,
        symbol
    ) {
    }

    function getSantaNonFungibleToken(
        address to,
        uint256 tokenId,
        string calldata uri
    ) external {
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
}
