# Backend Development Documentation (后端开发文档)

This document outlines the backend architecture and development practices for the QuanJin Mahjong application.
本文档概述了泉金麻将应用的后端架构和开发实践。

## 1. Technology Stack (技术栈)

The backend is built using a modern serverless approach leveraging the Next.js App Router and Genkit for AI functionalities.
后端采用现代化的无服务器方法构建，利用 Next.js App Router 和 Genkit 实现 AI 功能。

-   **Framework (框架)**: Next.js (App Router)
-   **Primary Logic (主要逻辑)**: Next.js Server Actions
-   **AI Integration (AI 集成)**: Google Genkit

This architecture allows for seamless integration of frontend components with backend logic, reducing the need for separate API endpoints and simplifying data fetching and mutations.
这种架构可以实现前端组件与后端逻辑的无缝集成，减少了对独立 API 端点的需求，并简化了数据获取和变更操作。

## 2. Project Structure (项目结构)

Key backend-related files and directories are organized as follows:
关键的后端相关文件和目录组织如下：

```
/
├── src/
│   ├── ai/
│   │   ├── flows/
│   │   │   └── suggest-move.ts   # Defines the Genkit AI flow (定义 Genkit AI 心流)
│   │   ├── dev.ts                # Genkit development server entry point (Genkit 开发服务器入口点)
│   │   └── genkit.ts             # Genkit global configuration (Genkit 全局配置)
│   │
│   └── app/
│       └── actions.ts            # Server Actions entry point (服务器动作入口点)
│
├── BACKEND_DOCUMENTATION.md      # This file (本文件)
└── SMART_CONTRACT_DOCUMENTATION.md # Smart Contract logic (智能合约逻辑)
```

-   `src/ai/`: Contains all Genkit-related code. (包含所有 Genkit 相关代码)
-   `src/app/actions.ts`: This file exposes server-side logic to the client-side components using Server Actions. It acts as the primary bridge between the UI and the backend logic. (该文件使用服务器动作向客户端组件暴露服务器端逻辑。它充当 UI 和后端逻辑之间的主要桥梁。)
-   `SMART_CONTRACT_DOCUMENTATION.md`: Outlines the design for the smart contracts. (概述了智能合约的设计。)

## 3. Core Backend Responsibilities (后端核心职责)

### Game Logic and Settlement (游戏逻辑与结算)

The core game logic, including state management and win/loss calculations, is handled within the `src/app/game/page.tsx` component for this prototype. In a production environment, this would be moved to a dedicated server-side service.
核心游戏逻辑，包括状态管理和输赢计算，在此原型中由 `src/app/game/page.tsx` 组件处理。在生产环境中，这部分逻辑将被移至专用的服务器端服务。

The entire process is currently simulated on the client-side but is designed to be moved to a secure server action or microservice. The final, verified results from this server-side process would then be used to call the `concludeGame` function on the smart contract.
整个过程目前在客户端模拟，但其设计旨在未来迁移到安全的服务器动作或微服务中。这个服务器端流程产生的最终、经过验证的结果，将被用于调用智能合约上的 `concludeGame` 函数。

-   **Game End Condition (游戏结束条件)**: The game concludes when any player's balance drops to 0 or below, or a player chooses to leave.
-   **Calculate Net Results (计算净结果)**: The system calculates the net win or loss for each player relative to their initial balance.
-   **Proportional Pot Distribution (按比例分配奖池)**: The prize pool (`pot`) is distributed among winners based on their net winnings.
-   **Table Fee (台费)**: The player with the highest net win (the "biggest winner") pays a table fee, equal to the room's entry fee. This amount is designated for a "burn pool".

### KYC (Know Your Customer) Verification (KYC 身份认证)

To ensure compliance and security, the application implements a multi-level KYC system. Each level unlocks access to higher-tier features. A production backend would follow this secure flow:
为确保合规性与安全性，本应用实现了一个多等级的KYC系统。一个生产环境的后端应遵循以下安全流程：

1.  **Data Submission (数据提交)**: The client securely submits user information to a server action.
2.  **Third-Party Integration (第三方集成)**: The backend **does not store sensitive identification documents**. It forwards the verification request to a professional third-party KYC provider (e.g., Sumsub, Persona, Veriff).
3.  **Process Webhooks (处理 Webhooks)**: The KYC provider notifies our backend of the verification result via a secure webhook.
4.  **Update User Profile (更新用户资料)**: Upon successful verification, the backend updates the user's KYC level in the database.
5.  **Enforce Access Control (强制执行访问控制)**: Other backend services (e.g., game room matchmaking) **must** check the user's KYC level before granting access.

## 4. Economic Model Orchestration (经济模型编排)

The backend plays a crucial role in orchestrating the on-chain economic activities, acting as a trusted "keeper" that calls smart contract functions based on off-chain events.
后端作为受信任的“守护者”，通过调用智能合约函数来编排链上经济活动，发挥着至关重要的作用。

### The Economic Loop (经济闭环)

The backend automates the value cycle of the platform's economy at the end of each epoch (e.g., every 24 hours).
在每个周期结束时（例如，每24小时），后端会自动执行平台的价值循环。

1.  **Profit Generation (利润产生)**: The off-chain gold futures quantitative strategy generates a Profit and Loss (PnL) result.
    (链下的黄金期货量化策略产生损益（PnL）结果。)
2.  **Trigger Buyback & Distribution (触发回购与分配)**: A scheduled backend job (e.g., a cron job) calls the `executeBuybackAndDistribute` function on the `Vault` smart contract. It passes the PnL data for the epoch.
    (一个预定的后端任务（如 cron job）调用 `Vault` 智能合约上的 `executeBuybackAndDistribute` 函数，并传递该周期的 PnL 数据。)
3.  **On-Chain Execution (链上执行)**: The `Vault` contract then autonomously performs two actions:
    (随后，`Vault` 合约自主执行两个操作：)
    a.  **Buyback & Burn (回购与销毁)**: Uses a portion of the profits to buy `$JIN` from the open market (e.g., a DEX) and sends some of it to the `BurnWallet`.
    (使用部分利润从公开市场（如DEX）回购 `$JIN`，并将其中的一部分发送到 `BurnWallet`。)
    b.  **Fund Staking Pool (注入质押池)**: Transfers the remaining portion of the bought-back `$JIN` to the `StakingPool` contract to serve as dividend rewards.
    (将回购的 `$JIN` 的剩余部分转移到 `StakingPool` 合约，作为分红奖励。)
4.  **Update NFT Energy (更新NFT能量)**: After each game, the backend calls the `updateEnergy` function on the `StakingPool` contract to adjust the energy levels of the participating players' staked NFTs based on their performance.
    (每场游戏结束后，后端会调用 `StakingPool` 合约上的 `updateEnergy` 函数，根据参与玩家的表现调整其质押NFT的能量水平。)

This automated, server-driven process ensures that value generated from the trading strategy is systematically reinvested into the ecosystem, rewarding token holders and stakers without requiring manual intervention.
这个由服务器驱动的自动化流程，确保了交易策略产生的价值被系统地再投资到生态系统中，奖励代币持有者和质押者，无需人工干预。
```