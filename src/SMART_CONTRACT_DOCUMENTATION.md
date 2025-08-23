# Smart Contract Development Documentation (智能合约开发文档)

This document outlines the conceptual design of the smart contracts that will underpin the QuanJin Mahjong platform's economy.
本文档概述了支撑泉金麻将平台经济体系的智能合约的概念设计。

**Note:** This is a design document. The contracts are not yet implemented.
**注意：** 这是一份设计文档，合约尚未实现。

## 1. Dual-Token Economic Model (双代币经济模型)

The ecosystem is powered by two distinct tokens, creating a balanced economic system that separates in-game utility from governance and value accrual.
该生态系统由两种不同的代币驱动，创建了一个平衡的经济体系，将游戏内效用与治理和价值积累分离开来。

-   **`QuanJinToken ($JIN)` - Utility Token (功能代币)**
    -   **Type**: ERC-20
    -   **Purpose**: `$JIN` is the primary currency for all in-game activities. It is the engine of the game's economy.
        (`$JIN` 是所有游戏内活动的主要货币，是游戏经济的引擎。)
    -   **Use Cases (使用场景)**:
        -   Paying entry fees for game rooms (支付游戏房间的入场费).
        -   Purchasing NFT Keys and Shards from the marketplace (在市场上购买NFT密钥和碎片).
        -   Paying for NFT synthesis and energy refills in the Workshop (在工坊中支付NFT合成和能量补充的费用).
        -   Receiving as dividends from the `StakingPool` (从 `StakingPool` 中接收分红).

-   **`QuanJinMacroToken ($GMD)` - Governance & Reward Token (治理与奖励代币)**
    -   **Type**: ERC-20
    -   **Purpose**: `$GMD` represents a stake in the platform's success and governance rights. It is earned, not bought within the primary game loop.
        (`$GMD` 代表在平台成功中的股份和治理权。它是在主要游戏循环中赚取的，而非购买的。)
    -   **Use Cases (使用场景)**:
        -   Earned as the primary reward for staking NFT Keys in the `StakingPool` (作为在 `StakingPool` 中质押NFT密钥的主要奖励而获得).
        -   Used for voting on DAO proposals (用于对DAO提案进行投票).
        -   Represents a claim on the platform's long-term value accrual (代表对平台长期价值积累的权益).

## 2. Core Contracts Overview (核心合约概述)

1.  **`QuanJinToken ($JIN)`**: The ERC-20 utility token contract. (ERC-20 功能代币合约。)
2.  **`QuanJinMacroToken ($GMD)`**: The ERC-20 governance token contract. (ERC-20 治理代币合约。)
3.  **`QuanJinKeyNFT`**: An ERC-721 contract for the NFT Keys. (NFT 密钥的 ERC-721 合约。)
4.  **`GameRoomManager`**: Manages game entry fees and prize pool distribution. (管理游戏入场费和奖池分配。)
5.  **`StakingPool`**: Manages NFT staking, energy levels, and reward distribution (`$GMD` and `$JIN`). (管理NFT质押、能量水平和奖励分配。)
6.  **`Vault`**: Executes the buyback-and-distribute mechanism using profits from the gold futures strategy. (使用黄金期货策略的利润执行回购和分配机制。)
7.  **`BurnWallet`**: A designated address for all burned tokens (e.g., table fees, buyback burns). (一个指定的地址，用于接收所有被销毁的代币。)

## 3. Contract Logic Details (合约逻辑详解)

### `GameRoomManager` Contract

Handles the flow of funds for each match.
处理每场比赛的资金流动。

-   **`createGame(playerAddresses[], entryFee)`**: Called by the backend to lock entry fees from players into the contract's prize pool. (由后端调用，将玩家的入场费锁定在合约的奖池中。)
-   **`concludeGame(gameId, winners[], winnings[], biggestWinner, tableFee)`**:
    -   Called exclusively by a trusted backend server (`owner`).
        (仅由受信任的后端服务器调用。)
    -   Distributes the prize pool (`winnings`) to the `winners`.
        (将奖池分配给赢家。)
    -   Transfers the `tableFee` from the prize pool to the `BurnWallet` address.
        (将台费从奖池转移到 `BurnWallet` 地址。)

### `StakingPool` Contract

The heart of the "Play-to-Earn" mechanism, rewarding long-term participants.
“边玩边赚”机制的核心，奖励长期参与者。

-   **Reward Logic (奖励逻辑)**: Stakers earn rewards in two forms:
    1.  **`$GMD` Mining**: Continuously minted based on the staker's proportional "Weight" of the total pool.
        (根据质押者在总池中的“权重”比例，持续挖出 `$GMD`。)
    2.  **`$JIN` Dividends**: Receives `$JIN` tokens from the `Vault` contract and distributes them to stakers as a dividend.
        (从 `Vault` 合约接收 `$JIN` 代币，并将其作为分红分配给质押者。)
-   **`updateEnergy(playerAddress, energyChange)`**:
    -   Called by the backend to update a player's staked NFT energy levels based on game performance.
        (由后端调用，根据玩家的游戏表现更新其质押NFT的能量水平。)
    -   `require(msg.sender == owner)`: Ensures only the backend can modify energy.
        (确保只有后端可以修改能量。)

### `Vault` Contract

The engine of the economic model, converting external profits into ecosystem value.
经济模型的引擎，将外部利润转化为生态系统价值。

-   **`executeBuybackAndDistribute(usdcProfit, jinToBurnPercent, jinToStakingPercent)`**:
    -   **Description (描述)**: Called periodically by a trusted backend server. This function uses the profits (e.g., in USDC) from the quantitative trading strategy to benefit the token ecosystem.
        (由受信任的后端服务器定期调用。该函数使用量化交易策略的利润（例如，以USDC计）来惠及代币生态系统。)
    -   **Logic (逻辑)**:
        1.  `require(msg.sender == owner)`: Ensures only the backend can trigger this critical function.
            (确保只有后端可以触发此关键功能。)
        2.  **Swap**: The contract interacts with a DEX (e.g., Uniswap) to swap the `usdcProfit` for `$JIN` tokens.
            (合约与DEX（如Uniswap）交互，将 `usdcProfit` 兑换成 `$JIN` 代币。)
        3.  **Burn**: It calculates the amount of `$JIN` to burn based on `jinToBurnPercent` and transfers it to the `BurnWallet`.
            (根据 `jinToBurnPercent` 计算要销毁的 `$JIN` 数量，并将其转移到 `BurnWallet`。)
        4.  **Distribute**: It calculates the remaining `$JIN` and transfers it to the `StakingPool` contract to be distributed as dividends to stakers.
            (计算剩余的 `$JIN` 并将其转移到 `StakingPool` 合约，作为分红分配给质押者。)
        5.  Emits a `VaultActivity` event detailing the amounts swapped, burned, and distributed.
            (发出一个 `VaultActivity` 事件，详细说明兑换、销毁和分配的金额。)

## 4. On-Chain vs. Off-Chain Logic (链上与链下逻辑)

This hybrid approach ensures fast-paced gameplay is not hindered by blockchain transaction times, while economic value and asset ownership remain secure and decentralized on the blockchain.
这种混合方法确保了快节奏的游戏体验不受区块链交易时间的限制，同时经济价值和资产所有权在链上保持安全和去中心化。

-   **Off-Chain (链下)**:
    -   Mahjong game logic (麻将游戏逻辑).
    -   Player matching (玩家匹配).
    -   Calculating final scores, pot distribution, and table fees (计算最终得分、奖池分配和台费).
    -   Gold futures quantitative trading strategy (黄金期货量化交易策略).

-   **On-Chain (链上)**:
    -   Holding and transferring funds (`$JIN`, `$GMD`). (资金的持有和转移。)
    -   NFT ownership and staking status. (NFT所有权和质押状态。)
    -   Final, verified settlement of game funds. (经过验证的游戏资金最终结算。)
    -   Automated buyback, burn, and dividend distribution via the `Vault` contract. (通过 `Vault` 合约自动执行回购、销毁和分红分配。)
```