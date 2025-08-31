# 泉金麻将前端UI设计文档 (顶级版)
## Frontend UI Design Documentation (Top-Tier Edition)

本文档是**《闽南链游UI场景优化设计方案》**的官方前端实现纲领，旨在将宏大的设计构想转化为具体、可执行的前端开发规范。
This document serves as the official frontend implementation guide for the **"Minnan Chain Game UI Scene Optimization Design Plan"**, aiming to translate grand design concepts into concrete, actionable frontend development standards.

---

### 1. 设计哲学与核心美学
### Design Philosophy & Core Aesthetics

我们的设计哲学根植于一种独特的二元融合：**闽南传统文化的典雅厚重**与**黄金量化交易的未来科技感**。
Our design philosophy is rooted in a unique dual fusion: the **elegant depth of Minnan traditional culture** and the **futuristic, technological feel of gold quantitative trading**.

- **色彩基调 (Color Palette):**
  - **主色 (Primary):** `金色 (Gold - hsl(45 95% 55%))` - 象征财富、分红与荣耀，贯穿于所有高价值元素，如代币、NFT、胡牌特效。
  - **辅色 (Secondary):** `墨绿 (Ink Green - hsl(150 50% 15%))` - 源于传统麻将牌桌的颜色，营造出专业、沉静的游戏氛围。
  - **背景色 (Background):** `深邃蓝黑 (Deep Blue-Black - hsl(220 20% 5%))` - 提供了科技感和未来感的基底，能完美衬托金色与绿色的视觉效果。
  - **点缀色 (Accent):** `喜庆红 (Festive Red - hsl(0 70% 45%))` - 用于胡牌、警告以及其他需要强烈视觉提示的交互元素。

- **材质质感 (Material & Texture):**
  - **木雕纹理 (Wood Carving):** 应用于游戏大厅的背景装饰、UI面板的边框，唤起闽南古厝的温暖与工艺感。
  - **玉石/黄金 (Jade/Gold):** 作为NFT Key、高级代币和筹码的核心材质，通过光泽和反射效果体现其价值。
  - **赛博光效 (Cyber Glow):** 用于按钮悬停、数据可视化图表、胜利动画等，注入Web3的未来感。

- **UI风格 (UI Style):**
  - **极简高质感 (Minimalist High-Fidelity):** 界面元素本身保持简洁，但通过精致的材质、光影和微动画来提升整体品质感。
  - **场景化设计 (Scene-based Design):** 抛弃传统的平面菜单，将功能入口（如市场、DAO）融入到“闽南古厝广场”的3D概念场景中，增强代入感。

---

### 2. 核心组件库设计规范
### Core Component Library Design Specification

所有UI组件都应遵循统一的设计语言，确保视觉一致性。

- **卡片 (`Card`):**
  - **背景:** 采用半透明的 `hsl(var(--card))`，配合 `backdrop-blur` 营造毛玻璃效果，体现科技感。
  - **边框:** 使用带有渐变或微光的 `hsl(var(--primary) / 0.2)`，模拟能量光晕。
  - **交互:** 鼠标悬停时，边框光效增强，卡片轻微上浮，提供明确的视觉反馈。

- **按钮 (`Button`):**
  - **主按钮:** 填充 `hsl(var(--primary))` 金色，字体颜色为深色，带有细微的内发光效果。
  - **次按钮:** 线框风格，边框为金色，背景透明。悬停时背景填充为金色，文字变色。
  - **图标:** 所有按钮内的图标（如`lucide-react`）应与文字大小协调，并继承按钮的颜色状态。

- **HUD (头部显示层) 面板:**
  - 游戏内的所有信息面板（如玩家信息、牌墙计数）都应遵循HUD设计。
  - **风格:** 采用无边框或极细边框的深色半透明面板，文字和图标带有微弱的辉光效果，使其仿佛悬浮在游戏场景之上。

---

### 3. 场景化UI实现蓝图
### Scene-based UI Implementation Blueprint

#### 3.1 游戏大厅 (Game Lobby - `src/app/page.tsx`)

- **布局:** 从`Tabs`切换改为**场景化分区**。使用`LobbySection`组件构建“自由对局”、“赛事中心”等模块，每个模块都像一个独立的“牌楼”或“建筑入口”。
- **房间卡片:** 重新设计房间卡片，强化信息层级。`tierDisplay`（如“新手场”）作为主标题，`description`提供玩法简介，入场费和在线玩家等核心数据以更具视觉冲击力的方式展示。
- **未来迭代方向:** 引入`React Three Fiber`或`Three.js`，将2D的房间卡片升级为环绕广场的3D麻将桌模型，点击桌子进入对局。

#### 3.2 对局场景 (Game Scene - `src/app/game/page.tsx`)

这是沉浸式体验的核心，当前阶段通过精密的2D布局模拟3D空间感。

- **桌面布局 (`GameBoard`):**
  - **结构:** 采用**同心圆式**或**结构化分区**布局，确保信息从“全局”到“个人”的逻辑层次。
  - **牌墙:** 可视化牌墙是增强真实感的关键。它应作为一个独立的UI层，并随着游戏进程动态减少。
  - **弃牌/明牌区:** 整合为中央信息池，通过带标签和可水平滚动的`ScrollArea`来解决竖屏空间限制。
- **动画表现 (未来迭代):**
  - **翻金:** 金牌翻开时，应伴有金色光效和粒子迸发效果。
  - **胡牌:** 触发全屏动画，如一条金色巨龙从屏幕穿过，同时结算面板以动态方式飞入玩家的账户区域。

#### 3.3 个人中心 (Profile - `src/app/profile/page.tsx`)

- **头部信息:** 采用宽幅背景图+大头像的组合，增强视觉冲击力。用户信息（名称、地址、代币余额、KYC状态）整合在头像下方，形成一个紧凑的“身份卡”。
- **数据统计:** 摒弃简单的列表，使用`StatCard`组件将核心数据（胜率、场次、胡牌次数）以仪表盘的形式可视化展示。
- **高光时刻:** 预留“本周最佳牌局”或“最大番型”等模块，为未来的赛后回放和社交分享功能奠定基础。

---

### 4. 技术栈与未来展望
### Tech Stack & Future Outlook

- **当前实现 (Current Implementation):**
  - **框架:** Next.js (App Router)
  - **UI库:** ShadCN UI
  - **样式:** Tailwind CSS
  - **状态管理:** React Hooks (`useState`, `useContext`)
  - **核心优势:** 开发效率高，组件化完善，易于维护和快速迭代。

- **未来3D化演进 (Future 3D Evolution):**
  - **核心技术:** `React Three Fiber` + `Drei` (用于在React中声明式地构建Three.js场景)。
  - **演进路线:**
    1.  **阶段一 (模型引入):** 将游戏内的麻将牌、骰子替换为基础的3D模型。
    2.  **阶段二 (场景搭建):** 将整个游戏桌台3D化，实现真实的灯光、阴影和材质效果。
    3.  **阶段三 (沉浸式大厅):** 将游戏大厅完全3D化，实现玩家虚拟形象在“古厝广场”中的漫游和交互。
    4.  **UI集成:** 始终保留HTML/CSS构建的UI作为3D场景的HUD层，以确保信息展示的清晰度和开发的便捷性。

本设计文档将作为项目迭代的最高纲领，指导每一次UI/UX的优化与升级，确保最终产品能够完美达成设计目标，为玩家提供前所未有的链上麻将娱乐体验。
This design document will serve as the project's highest directive, guiding every UI/UX optimization and upgrade to ensure the final product perfectly achieves its design goals and offers players an unprecedented on-chain mahjong entertainment experience.
