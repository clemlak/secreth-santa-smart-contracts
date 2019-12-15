# 🎅 SecretSanta
> 👤 Clemlak
```
Secret Santa with NFTs (www.secrethsanta.co)
```


### 📋 Notice

All the logic of the contract happens here



### 📡 Networks

The contract has been deployed to:
* **Network 1**: `0x8496B5CE2851B1DA7833e61B84043890b4b94bFA`



### 🎟 Events


#### OwnershipTransferred
| Name | Indexed | Type |
|:-:|:-:|:-:|
| previousOwner | `true` | `address` |
| newOwner | `true` | `address` |


#### PresentSent
| Name | Indexed | Type |
|:-:|:-:|:-:|
| from | `true` | `address` |
| to | `true` | `address` |
| token | `false` | `address` |
| tokenId | `false` | `uint256` |


#### PrizeAdded
| Name | Indexed | Type |
|:-:|:-:|:-:|
| from | `true` | `address` |
| tokens | `false` | `address[]` |
| tokensId | `false` | `uint256[]` |



## `isOwner`

>👀 `view`



### 🔎 Details

Returns true if the caller is the current owner.

### → Returns



| Name | Type |
|:-:|:-:|
|  Not specified  | `bool` |



## `isPrizeClaimed`

>👀 `view`




### → Returns



| Name | Type |
|:-:|:-:|
|  Not specified  | `bool` |



## `lastPresentAt`

>👀 `view`




### → Returns



| Name | Type |
|:-:|:-:|
|  Not specified  | `uint256` |



## `lastSecretSanta`

>👀 `view`




### → Returns



| Name | Type |
|:-:|:-:|
|  Not specified  | `address` |



## `owner`

>👀 `view`



### 🔎 Details

Returns the address of the current owner.

### → Returns



| Name | Type |
|:-:|:-:|
|  Not specified  | `address` |



## `prizeDelay`

>👀 `view`




### → Returns



| Name | Type |
|:-:|:-:|
|  Not specified  | `uint256` |



## `prizeTokens`

>👀 `view`




### → Returns



| Name | Type |
|:-:|:-:|
|  Not specified  | `address` |



## `prizeTokensId`

>👀 `view`




### → Returns



| Name | Type |
|:-:|:-:|
|  Not specified  | `uint256` |



## `renounceOwnership`

>👀 `nonpayable`



### 🔎 Details

Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner.     * NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.



## `transferOwnership`

>👀 `nonpayable`



### 🔎 Details

Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.



## `whitelist`

>👀 `view`




### → Returns



| Name | Type |
|:-:|:-:|
|  Not specified  | `bool` |



## `sendPrize`

>👀 `nonpayable`

### 📋 Notice

Send tokens to the prize



### ⚙️ Parameters

| Name | Type | Description |
|:-:|:-:| - |
| tokensId | `address[]` | An array with the id of the tokens |



## `sendPresent`

>👀 `nonpayable`

### 📋 Notice

Sends a present



### ⚙️ Parameters

| Name | Type | Description |
|:-:|:-:| - |
| tokenId | `address` | The id of the token |



## `claimPrize`

>👀 `nonpayable`

### 📋 Notice

Claims the prize





## `updateWhitelist`

>👀 `nonpayable`






## `getPrize`

>👀 `view`




### → Returns



| Name | Type |
|:-:|:-:|
|  tokens  | `address[]` |
|  tokensId  | `uint256[]` |



## `isTooLate`

>👀 `view`




### → Returns



| Name | Type |
|:-:|:-:|
|  Not specified  | `bool` |
