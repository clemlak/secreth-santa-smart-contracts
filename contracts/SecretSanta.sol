pragma solidity 0.5.13;


contract ERC20OrERC721Token {
    function transferFrom(address from, address to, uint256 value) public;
}


/**
 * @title An amazing project called SecretSanta
 * @dev This contract is the base of our project
 */
contract SecretSanta {
    address[] public secretSantas;

    uint256 public end = 1577836799;

    address[] public consolationTokens;
    uint256[] public consolationTokensId;

    event PresentSent(
        address indexed from,
        address indexed to,
        address[] tokens,
        uint256[] tokensId
    );

    function sendConsolation(
        address[] calldata tokens,
        uint256[] calldata tokensId
    ) external {
        require(
            tokens.length == tokensId.length,
            "Invalid present"
        );

        for (uint256 i = 0; i < tokens.length; i += 1) {
            ERC20OrERC721Token token = ERC20OrERC721Token(tokens[i]);
            token.transferFrom(
                msg.sender,
                address(this),
                tokensId[i]
            );

            consolationTokens.push(tokens[i]);
            consolationTokensId.push(tokensId[i]);
        }

        secretSantas.push(msg.sender);
    }

    function sendPresent(
        address[] calldata tokens,
        uint256[] calldata tokensId
    ) external {
        require(
            tokens.length == tokensId.length,
            "Invalid present"
        );

        for (uint256 i = 0; i < tokens.length; i += 1) {
            ERC20OrERC721Token token = ERC20OrERC721Token(tokens[i]);
            token.transferFrom(
                msg.sender,
                secretSantas[secretSantas.length - 1],
                tokensId[i]
            );
        }

        secretSantas.push(msg.sender);
    }

    function claimConsolation() external {
        require(
            now > end,
            "Not yet"
        );

        require(
            msg.sender == secretSantas[secretSantas.length - 1],
            "Consolation not sender"
        );

        for (uint256 i = 0; i < consolationTokens.length; i += 1) {
            ERC20OrERC721Token token = ERC20OrERC721Token(consolationTokens[i]);

            token.transferFrom(
                address(this),
                msg.sender,
                consolationTokensId[i]
            );
        }
    }

    function getSecretSantas() external view returns (address[] memory) {
        return secretSantas;
    }
}
