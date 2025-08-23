# Smart Contract Development Documentation (智能合约开发文档)

This document outlines the conceptual design of the smart contracts that will underpin the QuanJin Mahjong platform's economy.
本文档概述了支撑泉金麻将平台经济体系的智能合约的概念设计。

**Note:** This is a design document. The contracts are not yet implemented.
**注意：** 这是一份设计文档，合约尚未实现。

## 1. Tokenomics & Issuance (代币经济学与发行)

The ecosystem is powered by a dual-token model to create a balanced economic system that separates in-game utility from governance and long-term value accrual.
该生态系统由双代币模型驱动，旨在创建一个平衡的经济体系，将游戏内效用与治理和长期价值积累分离开来。

### QuanJinToken ($JIN) - The Utility Token (功能代币)

$JIN is the lifeblood of the game's economy, used for all primary transactions.
$JIN 是游戏经济的命脉，用于所有主要交易。

-   **Type (类型)**: ERC-20
-   **Total Supply (总供应量)**: **1,000,000,000 $JIN** (10亿枚)
-   **Issuance (发行方式)**: All tokens are minted at the Token Generation Event (TGE) and distributed according to the allocation schedule. There is no further issuance.
    (所有代币在代币生成事件时一次性铸造完成，并根据分配计划进行分发，永不增发。)
-   **Allocation (代币分配)**:
    | Category (类别)           | Percentage (百分比) | Vesting Details (解锁详情)                               |
    | ------------------------- | ------------------- | -------------------------------------------------------- |
    | Ecosystem Fund (生态基金) | 40%                 | 用于游戏奖励、市场推广、社区活动等。                     |
    | Staking Rewards (质押奖励)  | 20%                 | 作为从 Vault 注入 StakingPool 的初始流动性。             |
    | Team (团队)               | 15%                 | 12个月锁定期，之后36个月线性解锁。                       |
    | Investors (投资者)        | 15%                 | 根据轮次有不同的锁定期和解锁计划。                       |
    | Liquidity (流动性)        | 5%                  | 用于在去中心化交易所（DEX）提供初始流动性。              |
    | Treasury (金库)           | 5%                  | 作为储备金，用于应对未来发展和紧急情况。                 |
-   **Primary Acquisition (主要获取方式)**:
    1.  Purchasing on the open market (e.g., DEX). (在公开市场，如DEX上购买。)
    2.  Receiving as **$JIN dividends** from the `StakingPool` after staking an NFT Key. These dividends are funded by the `Vault`'s buyback mechanism. (质押NFT密钥后，从 `StakingPool` 获得 $JIN 分红。这些分红由 `Vault` 的回购机制提供资金。)

### QuanJinMacroToken ($GMD) - The Governance & Reward Token (治理与奖励代币)

$GMD represents a stake in the platform's success and governance rights. It is designed to be earned, not bought.
$GMD 代表了在平台成功中的股份和治理权。它的设计初衷是“赚取”，而非“购买”。

-   **Type (类型)**: ERC-20
-   **Total Supply (总供应量)**: **100,000,000 $GMD** (1亿枚)
-   **Issuance (发行方式)**: **No pre-mine, no pre-sale.** $GMD is generated exclusively through the NFT staking mechanism in the `StakingPool`.
    (**无预挖，无预售。** $GMD 只能通过在 `StakingPool` 中质押NFT来产出。)
-   **Output Mechanism (产出机制)**:
    -   **Epoch-Based Emission (基于周期的释放)**: A fixed amount of $GMD is released in each epoch (e.g., every 24 hours).
        (每个周期（例如24小时）会释放固定数量的 $GMD。)
    -   **Weight-Based Distribution (基于权重的分配)**: The $GMD rewards for each epoch are distributed to stakers based on their proportional "Weight" relative to the total weight of all staked NFTs in the pool.
        (每个周期的 $GMD 奖励，根据质押者所持NFT的“权重”占池中所有质押NFT总权重的比例进行分配。)
        -   `Your Epoch Reward = (Your Total Weight / Global Total Weight) * Epoch GMD Emission`
        -   `您的周期奖励 = (您的总权重 / 全局总权重) * 周期GMD释放量`
    -   **Halving Mechanism (减半机制)**: To preserve long-term value, the epoch emission rate of $GMD will be halved periodically (e.g., every 2 years), creating a deflationary pressure over time.
        (为保持长期价值， $GMD 的周期释放率将定期减半（例如，每2年一次），从而随着时间的推移产生通缩压力。)

## 2. NFT Issuance & Mechanics (NFT 发行与机制)

The NFT Keys are the core assets for participating in the platform's value-add cycles.
NFT 密钥是参与平台价值增值循环的核心资产。

### QuanJinKeyNFT - The Staking Asset (质押资产)

-   **Type (类型)**: ERC-721
-   **Levels & Supply (等级与供应量)**:
    | Level (等级) | Name (名称)           | Total Supply (总供应量) | Issuance Method (发行方式)                               |
    | ------------ | --------------------- | ----------------------- | -------------------------------------------------------- |
    | 5            | 金龙 (Golden Dragon)  | **500**                 | 只能由 Level 4 升级 (Upgrade from Lvl 4 only)              |
    | 4            | 金鼎 (Golden Tripod)  | **3,000**               | 只能由 Level 3 升级 (Upgrade from Lvl 3 only)              |
    | 3            | 金脉 (Golden Vein)    | **10,000**              | 只能由 Level 2 升级 (Upgrade from Lvl 2 only)              |
    | 2            | 金潮 (Golden Tide)    | **50,000**              | 只能由 Level 1 升级 (Upgrade from Lvl 1 only)              |
    | 1            | 金砂 (Golden Sand)    | **Unlimited**           | 市场购买或碎片合成 (Market purchase or Shard Synthesis) |

### Core Mechanisms (核心机制)

1.  **Shard Synthesis Mechanism (碎片合成机制)**:
    -   **Source**: Players can earn Shards (e.g., Bamboo, Dots, Character Shards) through gameplay. (玩家可通过游戏对局获得碎片。)
    -   **Recipe**: A fixed recipe allows players to combine these shards with a small $JIN fee to mint a new Level 1 "Golden Sand" NFT. (一个固定的配方允许玩家组合这些碎片并支付少量 $JIN 费用，来铸造一个新的 Level 1 “金砂” NFT。)
        -   `Example: 10 Bamboo Shards + 10 Dots Shards + 10 Character Shards + 10 $JIN = 1x Golden Sand NFT`
    -   **Purpose**: This provides a "Free-to-Own" pathway for active players to acquire their first productive asset. (这为活跃玩家提供了一个“免费拥有”的途径来获取他们的第一个生产性资产。)

2.  **Upgrade & Burn Mechanism (升级与销毁机制)**:
    -   **Scarcity Driver**: Higher-level NFTs cannot be directly purchased. They can only be created by upgrading lower-level NFTs. (更高级别的NFT无法直接购买，只能通过升级低级别NFT来创建。)
    -   **Recipe**: To upgrade, a player must **burn** a specific quantity of lower-level NFTs and pay a significant $JIN fee. (要进行升级，玩家必须**销毁**指定数量的低级别NFT，并支付一笔可观的 $JIN 费用。)
        -   `Example: 5x Golden Sand NFTs + 100 $JIN = 1x Golden Tide NFT`
    -   **Purpose**: This creates a deflationary pressure on lower-level NFTs and ensures the scarcity and value of higher-level assets, rewarding long-term commitment. (该机制为低级别NFT创造了通缩压力，并确保了高级别资产的稀缺性和价值，从而奖励长期投入的玩家。)


## 3. Core Contracts Overview (核心合约概述)

1.  **`QuanJinToken ($JIN)`**: The ERC-20 utility token contract. (ERC-20 功能代币合约。)
2.  **`QuanJinMacroToken ($GMD)`**: The ERC-20 governance token contract. (ERC-20 治理代币合约。)
3.  **`QuanJinKeyNFT`**: An ERC-721 contract for the NFT Keys. (NFT 密钥的 ERC-721 合约。)
4.  **`GameRoomManager`**: Manages game entry fees and prize pool distribution. (管理游戏入场费和奖池分配。)
5.  **`StakingPool`**: Manages NFT staking, energy levels, and reward distribution (`$GMD` and `$JIN`). (管理NFT质押、能量水平和奖励分配。)
6.  **`Vault`**: Executes the buyback-and-distribute mechanism using profits from the gold futures strategy. (使用黄金期货策略的利润执行回购和分配机制。)
7.  **`BurnWallet`**: A designated address for all burned tokens (e.g., table fees, buyback burns). (一个指定的地址，用于接收所有被销毁的代币。)

## 4. Contract Logic Details (合约逻辑详解)

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
    1.  **`$GMD` Mining**: Continuously minted based on the staker's proportional "Weight" of the total pool, following the emission and halving schedule.
        (根据质押者在总池中的“权重”比例，并遵循释放和减半计划，持续挖出 `$GMD`。)
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

## 5. On-Chain vs. Off-Chain Logic (链上与链下逻辑)

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
    -   Emission and distribution of `$GMD` rewards. ($GMD奖励的释放和分配。)
