pragma solidity 0.5.13;


contract ERC721 {
    function transferFrom(address from, address to, uint256 tokenId) public;
}


/**
 * @title An amazing project called SecretSanta
 * @dev This contract is the base of our project
 */
contract SecretSanta {
    struct Present {
        bytes32 promiseHash;
        address tokenContractAddress;
        uint256 tokenId;
        bool hasClaimedPresent;
    }

    address[] private secretSantas;
    mapping (address => Present) private presents;

    /* December 24th 2019 */
    uint256 public revealPeriodStart = 1577145600;

    /* January 1st 2020 */
    uint256 public latePresentsStart = 1577836800;

    event NewPromisedPresent(
        address indexed secretSanta,
        bytes32 promiseHash
    );

    event PresentRevealed(
        address indexed secretSanta,
        address tokenContractAddress,
        uint256 tokenId
    );

    function promisePresent(
        bytes32 promiseHash
    ) external {
        require(
            revealPeriodStart > now,
            "Too late"
        );

        presents[msg.sender] = Present({
            promiseHash: promiseHash,
            tokenContractAddress: address(0),
            tokenId: 0,
            hasClaimedPresent: false
        });

        emit NewPromisedPresent(
            msg.sender,
            promiseHash
        );
    }

    function revealPresent(
        address tokenContractAddress,
        uint256 tokenId,
        bytes32 salt
    ) external {
        require(
            now > revealPeriodStart,
            "Be patient"
        );

        require(
            presents[msg.sender].promiseHash ==
            keccak256(
                abi.encodePacked(
                    tokenContractAddress,
                    tokenId,
                    salt
                )
            ),
            "Wrong NFT"
        );

        presents[msg.sender].tokenContractAddress = tokenContractAddress;
        presents[msg.sender].tokenId = tokenId;

        ERC721 tokenContract = ERC721(tokenContractAddress);
        tokenContract.transferFrom(msg.sender, address(this), tokenId);

        emit PresentRevealed(
            msg.sender,
            tokenContractAddress,
            tokenId
        );
    }
}
