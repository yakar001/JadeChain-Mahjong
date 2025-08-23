
# Smart Contract Development Documentation (智能合约开发文档)

This document outlines the conceptual design and intended functionality of the smart contracts that will underpin the QuanJin Mahjong platform's economy.
本文档概述了支撑泉金麻将平台经济体系的智能合约的概念设计和预期功能。

**Note:** This is a design document. The contracts are not yet implemented.
**注意：** 这是一份设计文档，合约尚未实现。

## 1. Core Contracts Overview (核心合约概述)

The ecosystem will be managed by a suite of interconnected smart contracts, primarily:
整个生态系统将由一套互联的智能合约管理，主要包括：

1.  **`QuanJinToken ($JIN)`**: An ERC-20 token contract for the main game currency. (游戏主要货币的 ERC-20 代币合约。)
2.  **`QuanJinKeyNFT`**: An ERC-721 contract for the NFT Keys used in staking. (用于质押的 NFT 密钥的 ERC-721 合约。)
3.  **`StakingPool`**: The contract that manages NFT staking, energy levels, and reward distribution. (管理 NFT 质押、能量水平和奖励分配的合约。)
4.  **`GameRoomManager`**: A contract to manage game room creation, entry fees, and prize pool distribution. (管理游戏房间创建、入场费和奖池分配的合约。)
5.  **`BurnWallet`**: A simple address designated as the destination for all burned tokens (e.g., table fees). (一个指定的简单地址，作为所有销毁代币（如台费）的目的地。)

## 2. `GameRoomManager` Contract Logic (GameRoomManager 合约逻辑)

This contract is central to the gameplay loop and handles the flow of funds for each match.
该合约是游戏循环的核心，负责处理每场比赛的资金流动。

### Key Functions (关键功能)

-   **`createGame(playerAddresses[], entryFee)`**:
    -   **Description (描述)**: Called by the backend server when a new game is matched. It locks the entry fee from each player's wallet. (当新游戏匹配成功时由后端服务器调用。它会锁定每个玩家钱包中的入场费。)
    -   **Logic (逻辑)**:
        1.  `require(playerAddresses.length == 4)`: Ensures a full table. (确保满桌。)
        2.  For each player, call `$JIN.transferFrom(player, address(this), entryFee)`. This requires players to have pre-approved the `GameRoomManager` contract to spend their `$JIN`. (对每个玩家，调用 `$JIN.transferFrom` 方法。这需要玩家预先授权 `GameRoomManager` 合约花费他们的 `$JIN`。)
        3.  The total fees are held in the contract's prize pool (`pot`). (总费用作为奖池被合约持有。)
        4.  Emits a `GameCreated` event with a unique `gameId`. (发出一个带有唯一 `gameId` 的 `GameCreated` 事件。)

-   **`concludeGame(gameId, winners[], winnings[], biggestWinner, tableFee)`**:
    -   **Description (描述)**: Called exclusively by a trusted backend server (owner) after a game has finished and results are verified. It distributes the prize pool. (仅由受信任的后端服务器（所有者）在游戏结束并验证结果后调用。该函数负责分配奖池。)
    -   **Logic (逻辑)**:
        1.  `require(msg.sender == owner)`: Ensures only the backend can trigger payouts. (确保只有后端可以触发支付。)
        2.  `require(gameId exists and is active)`: Prevents replay attacks or invalid calls. (防止重放攻击或无效调用。)
        3.  Calculates the total payout to verify it matches the game's pot minus the table fee. (计算总支付金额，验证其与游戏奖池减去台费后的数额相符。)
        4.  For each winner in the `winners` array, transfer their share of the pot: `$JIN.transfer(winners[i], winnings[i])`. (为 `winners` 数组中的每个赢家转账其应得的奖池份额。)
        5.  If a `tableFee` is greater than 0, transfer it from the contract's holdings to the `BurnWallet` address: `$JIN.transfer(BurnWallet, tableFee)`. (如果 `tableFee` 大于0，则将该金额从合约持有的资金中转移到 `BurnWallet` 地址。)
        6.  Mark the `gameId` as concluded. (将 `gameId` 标记为已结束。)
        7.  Emits a `GameConcluded` event with detailed results. (发出一个包含详细结果的 `GameConcluded` 事件。)

## 3. `StakingPool` Contract Updates (StakingPool 合约更新)

The game's outcome can affect the staked NFTs. The backend will call this contract after a game.
游戏结果可能会影响已质押的 NFT。后端将在游戏结束后调用此合约。

### Key Function for Game Interaction (游戏交互的关键功能)

-   **`updateEnergy(playerAddress, energyChange)`**:
    -   **Description (描述)**: Called by the backend to update a player's staked NFT energy levels based on game performance (e.g., winning consumes energy, completing tasks restores it). (由后端调用，根据玩家的游戏表现更新其质押 NFT 的能量水平（例如，胜利消耗能量，完成任务恢复能量）。)
    -   **Logic (逻辑)**:
        1.  `require(msg.sender == owner)`: Only the trusted backend can update energy. (只有受信任的后端可以更新能量。)
        2.  Fetches the player's staked `tokenId` from a mapping `(address => uint256)`. (从一个映射中获取玩家质押的 `tokenId`。)
        3.  Updates the energy attribute associated with that `tokenId`. (更新与该 `tokenId` 关联的能量属性。)
        4.  `require(newEnergy <= maxEnergy)`: Ensures energy does not exceed the maximum for that NFT level. (确保能量不会超过该 NFT 等级的最大值。)
        5.  Emits an `EnergyUpdated` event. (发出一个 `EnergyUpdated` 事件。)

## 4. On-Chain vs. Off-Chain Logic (链上与链下逻辑)

-   **Off-Chain (链下)**:
    -   Mahjong game logic (tile dealing, discards, win condition checks). (麻将游戏逻辑（发牌、出牌、胡牌条件检查）。)
    -   Player matching. (玩家匹配。)
    -   Calculating final scores, pot distribution shares, and the table fee. (计算最终得分、奖池分配份额和台费。)

-   **On-Chain (链上)**:
    -   Holding and transferring funds (`$JIN`). (资金（`$JIN`）的持有和转移。)
    -   NFT ownership and staking status. (NFT 所有权和质押状态。)
    -   Final, verified settlement of funds post-game, including prize distribution and burning the table fee. (游戏结束后经过验证的最终资金结算，包括奖金分配和台费销毁。)

This hybrid approach ensures that the fast-paced gameplay is not hindered by blockchain transaction times, while the economic value and asset ownership remain secure and decentralized on the blockchain.
这种混合方法确保了快节奏的游戏体验不受区块链交易时间的限制，同时经济价值和资产所有权在链上保持安全和去中心化。
