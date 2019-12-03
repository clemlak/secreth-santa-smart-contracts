pragma solidity 0.5.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract SantaToken is ERC721 {
    constructor() public ERC721() {
    }

    function getSantaToken(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}
