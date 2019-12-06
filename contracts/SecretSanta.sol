pragma solidity 0.5.13;

import "@openzeppelin/contracts/ownership/Ownable.sol";


contract ERC721 {
    function transferFrom(address from, address to, uint256 tokenId) public;
}


/**
 * @title Secret Santa with NFTs
 * @notice All the logic of the contract happens here
 * @author Clemlak
 */
contract SecretSanta is Ownable {
    address[] public secretSantas;

    uint256 public lastPresentAt = 0;
    uint256 public consolationDelay = 2 weeks;

    address[] public consolationTokens;
    uint256[] public consolationTokensId;

    mapping (address => bool) public whitelist;

    event PresentSent(
        address indexed from,
        address indexed to,
        address token,
        uint256 tokenId
    );

    constructor() public {
        lastPresentAt = now;
    }

    /**
     * @notice Send tokens to the consolation present
     * @param tokens An array with the address of the contracts
     * @param tokensId An array with the id of the tokens
     */
    function sendConsolation(
        address[] calldata tokens,
        uint256[] calldata tokensId
    ) external {
        require(
            tokens.length == tokensId.length,
            "Invalid array"
        );

        require(
            lastPresentAt + consolationDelay > now,
            "Too late"
        );

        for (uint256 i = 0; i < tokens.length; i += 1) {
            require(
                whitelist[tokens[i]],
                "Token not whitelisted"
            );

            ERC721 token = ERC721(tokens[i]);
            token.transferFrom(
                msg.sender,
                address(this),
                tokensId[i]
            );

            consolationTokens.push(tokens[i]);
            consolationTokensId.push(tokensId[i]);
        }

        secretSantas.push(msg.sender);
        lastPresentAt = now;
    }

    /**
     * @notice Sends a present
     * @param tokenAddress The address of the contract
     * @param tokenId The id of the token
     */
    function sendPresent(
        address tokenAddress,
        uint256 tokenId
    ) external {
        require(
            lastPresentAt + consolationDelay > now,
            "Too late"
        );

        require(
            whitelist[tokenAddress],
            "Token not whitelisted"
        );

        ERC721 token = ERC721(tokenAddress);

        token.transferFrom(
            msg.sender,
            secretSantas[secretSantas.length - 1],
            tokenId
        );

        secretSantas.push(msg.sender);
        lastPresentAt = now;
    }

    /**
     * @notice Claims the consolation present
     */
    function claimConsolation() external {
        require(
            now > lastPresentAt + consolationDelay,
            "Not yet"
        );

        require(
            msg.sender == secretSantas[secretSantas.length - 1],
            "Sender not last Santa"
        );

        for (uint256 i = 0; i < consolationTokens.length; i += 1) {
            ERC721 token = ERC721(consolationTokens[i]);

            token.transferFrom(
                address(this),
                msg.sender,
                consolationTokensId[i]
            );
        }
    }

    function updateWhitelist(
        address[] calldata tokens,
        bool isApproved
    ) external onlyOwner() {
        for (uint256 i = 0; i < tokens.length; i += 1) {
            whitelist[tokens[i]] = isApproved;
        }
    }

    function getSecretSantas() external view returns (address[] memory) {
        return secretSantas;
    }

    function getConsolation() external view returns (
        address[] memory tokens,
        uint256[] memory tokensId
    ) {
        return (
            consolationTokens,
            consolationTokensId
        );
    }
}
