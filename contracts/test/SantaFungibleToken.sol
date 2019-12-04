pragma solidity 0.5.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract SantaFungibleToken is ERC20 {
    constructor() public ERC20() {
    }

    function getSantaFungibleToken(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
