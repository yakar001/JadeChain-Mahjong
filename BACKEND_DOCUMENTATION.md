
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
    -   `flows/`: Each file in this directory defines a specific AI-powered flow. A flow orchestrates calls to language models, tools, and other logic. (此目录中的每个文件定义一个特定的 AI 驱动的心流。心流负责协调对语言模型、工具和其他逻辑的调用。)
    -   `genkit.ts`: Central configuration for Genkit, including plugins (like Google AI) and default model settings. (Genkit 的中央配置，包括插件（如 Google AI）和默认模型设置。)
-   `src/app/actions.ts`: This file exposes server-side logic to the client-side components using Server Actions. It acts as the primary bridge between the UI and the backend logic, including AI flows and game settlement. (该文件使用服务器动作向客户端组件暴露服务器端逻辑。它充当 UI 和后端逻辑（包括 AI 心流和游戏结算）之间的主要桥梁。)
-   `SMART_CONTRACT_DOCUMENTATION.md`: Outlines the design and logic for the smart contracts that will govern the game's economy. (概述了将用于管理游戏经济的智能合约的设计和逻辑。)

## 3. Game Logic and Settlement (游戏逻辑与结算)

The core game logic, including state management and win/loss calculations, is handled within the `src/app/game/page.tsx` component for this prototype. In a production environment, this would be moved to a dedicated server-side service.
核心游戏逻辑，包括状态管理和输赢计算，在此原型中由 `src/app/game/page.tsx` 组件处理。在生产环境中，这部分逻辑将被移至专用的服务器端服务。

### Game Settlement Flow (游戏结算流程)

1.  **Game End Condition (游戏结束条件)**: The game concludes when any player's balance (chip count) drops to 0 or below, or a player chooses to leave the game. (当任何玩家的余额（筹码数）降至0或以下，或有玩家选择离开时，游戏结束。)
2.  **Calculate Net Results (计算净结果)**: The system calculates the net win or loss for each player relative to the initial balance (`INITIAL_BALANCE`). (系统计算每个玩家相对于初始余额的净输赢。)
3.  **Identify Winners and Losers (识别赢家和输家)**: Players with a balance greater than the initial amount are winners; those with less are losers. (余额高于初始金额的玩家为赢家；低于的为输家。)
4.  **Proportional Pot Distribution (按比例分配奖池)**: The total prize pool (`pot`, funded by entry fees) is distributed among the winners based on the proportion of their net winnings. (总奖池（由入场费构成）根据赢家们的净赢利比例进行分配。)
    -   `Winner's Share = (Winner's Net Win / Total Net Winnings of all Winners) * Total Pot`
    -   `赢家份额 = (赢家净赢利 / 所有赢家总净赢利) * 总奖池`
5.  **Table Fee (台费)**: The player with the highest net win (the "biggest winner") pays a table fee, which is equal to the room's entry fee (`roomFee`). This amount is deducted from their winnings and is designated for a "burn pool". (净赢利最高的玩家（“大赢家”）需支付等于房间入场费的台费。该金额将从其奖金中扣除，并被指定进入“销毁池”。)
6.  **Record Keeping (记录保存)**: The results of each match will be recorded and associated with the player's profile. (每场比赛的结果将被记录并与玩家的个人资料关联。)

This entire process is currently simulated on the client-side but is designed to be moved to a secure server action or microservice. The final, verified results from this server-side process would then be used to call the `concludeGame` function on the smart contract.
整个过程目前在客户端模拟，但其设计旨在未来迁移到安全的服务器动作或微服务中。这个服务器端流程产生的最终、经过验证的结果，将被用于调用智能合约上的 `concludeGame` 函数。

## 4. AI Flow Development (Genkit) (AI 心流开发)

We use Genkit to define and manage our AI-powered features.
我们使用 Genkit 来定义和管理我们的 AI 功能。

### How to Create a New AI Flow (如何创建新的 AI 心流)

1.  **Create a New File (创建新文件)**: Add a new file in `src/ai/flows/`, for example, `new-feature-flow.ts`.
2.  **Add `'use server';'`**: Start the file with the `'use server';` directive.
3.  **Define Schemas (定义模式)**: Use `zod` to define the input and output schemas for your flow.
4.  **Define the Prompt (定义提示)**: Use `ai.definePrompt` to create a reusable, typed prompt.
5.  **Define the Flow (定义心流)**: Use `ai.defineFlow` to wrap the prompt logic.
6.  **Export a Wrapper Function (导出包装函数)**: Create and export an async wrapper function that calls the flow.
7.  **Register the Flow (注册心流)**: Import your new flow file in `src/ai/dev.ts`.

## 5. Server Actions (服务器动作)

Server Actions are the interface between the client (React components) and the backend (Genkit flows, database logic, etc.).
服务器动作是客户端（React 组件）和后端（Genkit 心流、数据库逻辑等）之间的接口。

### How to Expose Logic to the Client (如何向客户端暴露逻辑)

1.  **Open `src/app/actions.ts`**: This is the central file for all server actions.
2.  **Import Logic**: Import the necessary functions (e.g., from a future game service or an AI flow).
3.  **Create and Export a Server Action**: Create a new `async` function that calls your backend logic. This function can now be directly imported and called from any client component.
    ```typescript
    // Example for a future server-side settlement function
    // 未来服务器端结算函数的示例
    export async function settleGame(finalPlayerStates: any): Promise<GameResult> {
      // This is where the secure settlement logic would run on the server.
      // 安全的结算逻辑将在此处的服务器上运行。
      // It would calculate distributions, fees, and update the database.
      // 它将计算分配、费用并更新数据库。
      // ...
    }
    ```
