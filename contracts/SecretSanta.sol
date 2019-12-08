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
    bool public isPrizeClaimed = false;

    uint256 public lastPresentAt;
    uint256 public prizeDelay;

    address[] public prizeTokens;
    uint256[] public prizeTokensId;

    mapping (address => bool) public whitelist;

    event PresentSent(
        address indexed from,
        address indexed to,
        address token,
        uint256 tokenId
    );

    event PrizeAdded(
        address indexed from,
        address tokens[],
        address tokensId[],
    );

    constructor(
        uint256 initialPrizeDelay
    ) public {
        lastPresentAt = now;
        prizeDelay = initialPrizeDelay;
    }

    /**
     * @notice Send tokens to the prize
     * @param tokens An array with the address of the contracts
     * @param tokensId An array with the id of the tokens
     */
    function sendPrize(
        address[] calldata tokens,
        uint256[] calldata tokensId
    ) external {
        require(
            tokens.length == tokensId.length,
            "Invalid array"
        );

        require(
            lastPresentAt + prizeDelay > now,
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

            prizeTokens.push(tokens[i]);
            prizeTokensId.push(tokensId[i]);
        }

        secretSantas.push(msg.sender);
        lastPresentAt = now;

        emit PrizeAdded(
            msg.sender,
            tokens,
            tokensId,
        );
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
            lastPresentAt + prizeDelay > now,
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

        emit PresentSent(
            msg.sender,
            secretSantas[secretSantas.length - 1],
            tokenAddress,
            tokenId
        );
    }

    /**
     * @notice Claims the prize
     */
    function claimPrize() external {
        require(
            now > lastPresentAt + prizeDelay,
            "Not yet"
        );

        require(
            msg.sender == secretSantas[secretSantas.length - 1],
            "Sender not last Santa"
        );

        for (uint256 i = 0; i < prizeTokens.length; i += 1) {
            ERC721 token = ERC721(prizeTokens[i]);

            token.transferFrom(
                address(this),
                msg.sender,
                prizeTokensId[i]
            );
        }

        isPrizeClaimed = true;
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

    function getPrize() external view returns (
        address[] memory tokens,
        uint256[] memory tokensId
    ) {
        return (
            prizeTokens,
            prizeTokensId
        );
    }

    function isTooLate() external view returns (bool) {
        return now > lastPresentAt + prizeDelay;
    }
}
