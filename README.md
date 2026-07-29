<div align="center">

# 🐾 Animal Cup Desktop

**AI 动物足球模拟器 · 桌面应用**

从 8 支动物国家队中挑选你的队伍，排布阵型，观看或亲自操控 7v7 足球赛事。
支持单机、局域网对战、公网联机——安装即用，无需浏览器。

Pick from 8 animal national teams, set your formation, watch or control
a 7v7 match. Solo, LAN, or online — install and play, no browser needed.

[English](#english) · [中文](#中文)

</div>

---

<a name="中文"></a>

## 中文

> **项目来源**
> 本项目基于 [HappySeeds](https://happyseeds.ai/) 平台上的原创作品
> [Animal Cup](https://app-ce3abc4512.happyseeds.space/) Remix 后，
> 使用 **Pi-Coding-Agent** 对 [animal-world-cup](https://github.com/NeoXu954/animal-world-cup)
> 进行二次开发并开源。

### 🎮 简介

Animal Cup 灵感来自经典街机足球游戏。从 8 支动物国家队中选择队伍、设置
阵型和难度，AI 模拟 7v7 足球赛，或亲自上场操控一名球员。

桌面应用基于 Electron 构建，**双击安装，开箱即用**。应用启动时自动在后台
运行 Next.js 生产服务器及局域网/公网中继服务，无需额外配置。

### 📦 下载安装

[GitHub Releases](https://github.com/lbuibui/animal-world-cup-desktop/releases)
提供最新版本：

| 平台 | 安装包 |
| --- | --- |
| **macOS** | `Animal-Cup-{version}-arm64.dmg` |
| **Windows** | `Animal-Cup-Setup-{version}.exe` |
| **Linux** | `Animal-Cup-{version}.AppImage` |

应用启动后每 4 小时自动检查更新（electron-updater + GitHub Releases），
无需手动升级。

### 🕹 游戏模式

| 模式 | 说明 |
| --- | --- |
| **单人观战** | AI vs AI，坐享比赛 |
| **单人操控** | 键盘/触屏操控一名球员，对抗 AI 队伍 |
| **局域网对战** | 大屏运行比赛，手机扫码变身手柄，双人对战 |
| **公网联机** | 6 位房间码邀请好友，支持双方直接操控或各自配对手机手柄 |

### 🏗 桌面应用架构

```text
┌──────────────────────────────────────────────────────┐
│                  Electron 主进程                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Next.js 15 生产服务器 (端口 13000)         │ │
│  │  Landing → Lobby → Match (Pixi.js 比赛引擎)       │ │
│  │         Pad / OnlinePad (手机手柄页面)             │ │
│  ├──────────────────────────────────────────────────┤ │
│  │  局域网中继 (ws, :13001)  │  公网中继 (:13002)     │ │
│  └──────────────────────────────────────────────────┘ │
│         无边框窗口 · 自定义标题栏 · 系统托盘             │
│         electron-updater 自动更新 · GitHub Releases    │
└──────────────────────────────────────────────────────┘
                          │ 公网生产环境
                          ▼
┌──────────────────────────────────────────────────────┐
│     Cloudflare Workers + Durable Objects (房间服务)    │
└──────────────────────────────────────────────────────┘
```

**启动流程**：Electron 主进程启动后，依次：
1. 以生产模式启动 Next.js（内嵌 HTTP server）
2. `fork` 局域网 WebSocket 中继进程（`script/lan-server.mjs`）
3. `fork` 公网房间中继进程（`script/online-server.mjs`）
4. 轮询 `/api/health` 等待服务就绪
5. 创建无边框窗口，加载 `http://localhost:13000`

**窗口特性**：
- 无边框窗口 + 自定义标题栏（`preload.mjs` 注入，适配 macOS/Windows）
- macOS 保留红绿灯按钮；Windows 自绘最小化/最大化/关闭
- 系统托盘：显示/退出
- macOS 关闭窗口不退出应用（符合平台惯例）

### 🚀 技术栈

| 层级 | 技术 |
| --- | --- |
| 桌面壳 | Electron 33 · electron-builder · electron-updater |
| 前端 | Next.js 15 (App Router) · React 19 |
| 比赛引擎 | Pixi.js 预编译运行时 (`public/match-runtime-min/`) |
| 多人对战 | 主机权威架构 — WebSocket (`ws`) 中继 + 公网二进制帧同步 (~30 FPS) |
| 公网服务 | Cloudflare Workers · Durable Objects |
| 构建 | pnpm · CI (GitHub Actions) |
| 测试 | Playwright (E2E) + 命令行协议验证 |
| 国际化 | 内置多语言 (`app/i18n/`) |
| 音频 | ElevenLabs 动物音效 |

### 📂 项目结构

```text
electron/
├── main.mjs             # 主进程：窗口管理、内嵌服务启动、托盘、IPC
├── preload.mjs          # 预加载：注入自定义标题栏、窗口控制 API
└── updater.mjs          # 自动更新：检查/下载/安装
app/                     # Next.js App Router
├── page.jsx             # 入口 → Landing
├── Landing.jsx          # 落地页：选队、阵型、难度、模式入口
├── layout.jsx           # 全局布局、PWA 元数据
├── lobby/               # 局域网大厅：QR 码、手柄配对
├── match/               # 比赛页：Pixi 画布、HUD、触控、进球特效
├── pad/                 # 局域网手机手柄
├── online/              # 公网房间 UI + 客户端协议 + 帧编解码
├── online-pad/          # 公网手机手柄入口
├── lan/                 # 局域网客户端协议
├── ui/                  # 通用组件：图标、队服、阵型图
├── data/                # 游戏数据：队伍、球员、阵型
├── audio/               # SoundBank 音效管理
├── i18n/                # 多语言字典
├── api/health/          # 健康检查端点
└── GameClient.jsx       # Pixi 引擎加载器
cloudflare/
└── online-worker.js     # Durable Object 公网房间服务
online/
└── shared.js            # Node / Worker 共用协议与校验
public/
└── match-runtime-min/   # 预构建比赛引擎（闭源）
script/                  # ~40 个脚本：构建、验证、资源生成、中继服务
.github/workflows/
└── build.yml            # CI：tag 触发三平台构建 → GitHub Releases
```

### 🛠 开发

```bash
pnpm install

# 启动 Next.js dev server (:13000)
pnpm dev

# 启动 Electron（连接上一步的 dev server）
pnpm desktop

# 局域网对战开发（dev server + LAN 中继）
pnpm dev:lan

# 公网联机开发（dev server + 本地房间中继）
pnpm dev:online
```

Electron 开发模式下，主进程检测到非打包状态，跳过内嵌服务启动，直接连接
外部 dev server。生产模式下则全自动启动所有服务。

### 🔧 构建与发布

```bash
# 生产构建 + 打包安装文件
pnpm desktop:build     # → dist-electron/*.dmg / *.exe / *.AppImage

# 仅构建到目录（不打包）
pnpm desktop:dir
```

**CI 自动发布**：推送 `v*` tag → GitHub Actions 并行构建三平台 → 发布到
GitHub Releases：

```bash
git tag v0.1.1
git push origin v0.1.1
```

**公网房间服务**（可选，仅公网联机需要）：

```bash
pnpm deploy:online     # 部署 Durable Objects 到 Cloudflare
```

### 🧪 测试

| 命令 | 说明 |
| --- | --- |
| `pnpm test:online` | 公网房间协议验证（命令行） |
| `pnpm test:online:browser` | Chrome E2E：双屏、触控、手柄、画布（Playwright） |

### 📄 许可证

[Apache License 2.0](./LICENSE)

---

<a name="english"></a>

## English

> **Origin**
> This project is derived from the original
> [Animal Cup](https://app-ce3abc4512.happyseeds.space/) on
> [HappySeeds](https://happyseeds.ai/), remixed and further developed
> from [animal-world-cup](https://github.com/NeoXu954/animal-world-cup)
> with **Pi-Coding-Agent** and open-sourced.

### 🎮 Overview

Animal Cup is inspired by classic arcade football games. Pick from 8 animal
national teams, set your formation and difficulty, then watch an AI-simulated
7v7 match or take control of a player yourself.

Built on Electron, it's a **double-click-to-install** desktop app.
On launch, it automatically starts a Next.js production server and
LAN/online relay services in the background — no configuration needed.

### 📦 Download

Get the latest version from
[GitHub Releases](https://github.com/lbuibui/animal-world-cup-desktop/releases):

| Platform | Installer |
| --- | --- |
| **macOS** | `Animal-Cup-{version}-arm64.dmg` |
| **Windows** | `Animal-Cup-Setup-{version}.exe` |
| **Linux** | `Animal-Cup-{version}.AppImage` |

The app checks for updates every 4 hours (electron-updater + GitHub Releases).
No manual upgrades needed.

### 🕹 Game Modes

| Mode | Description |
| --- | --- |
| **Watch (AI vs AI)** | Sit back and enjoy the match |
| **Play (solo)** | Control one player with keyboard/touch against an AI team |
| **LAN multiplayer** | Big screen runs the match, phones become wireless gamepads via QR code |
| **Online multiplayer** | 6-character room codes — direct controls or phone controllers on each side |

### 🏗 Architecture

```text
┌──────────────────────────────────────────────────────┐
│                Electron Main Process                  │
│  ┌──────────────────────────────────────────────────┐ │
│  │      Next.js 15 Production Server (:13000)       │ │
│  │  Landing → Lobby → Match (Pixi.js engine)        │ │
│  │         Pad / OnlinePad (phone controllers)       │ │
│  ├──────────────────────────────────────────────────┤ │
│  │  LAN relay (ws, :13001) │ Online relay (:13002)  │ │
│  └──────────────────────────────────────────────────┘ │
│    Frameless window · Custom titlebar · System tray   │
│    electron-updater · GitHub Releases                 │
└──────────────────────────────────────────────────────┘
                          │ Production online
                          ▼
┌──────────────────────────────────────────────────────┐
│   Cloudflare Workers + Durable Objects (room service) │
└──────────────────────────────────────────────────────┘
```

**Launch sequence**: on startup, the Electron main process:
1. Starts Next.js in production mode (embedded HTTP server)
2. Forks the LAN WebSocket relay (`script/lan-server.mjs`)
3. Forks the online room relay (`script/online-server.mjs`)
4. Polls `/api/health` until the server is ready
5. Creates a frameless window, loads `http://localhost:13000`

**Window features**:
- Frameless window with custom titlebar (injected via `preload.mjs`)
- macOS: native traffic light buttons; Windows: custom min/max/close
- System tray: Show / Quit
- Closing the window does not quit the app on macOS (platform convention)

### 🚀 Tech Stack

| Layer | Technology |
| --- | --- |
| Desktop shell | Electron 33 · electron-builder · electron-updater |
| Frontend | Next.js 15 (App Router) · React 19 |
| Match engine | Pre-built Pixi.js runtime (`public/match-runtime-min/`) |
| Multiplayer | Host-authoritative — WebSocket (`ws`) relay + binary frame sync (~30 FPS) |
| Online service | Cloudflare Workers · Durable Objects |
| Build | pnpm · CI (GitHub Actions) |
| Testing | Playwright (E2E) + CLI protocol verification |
| i18n | Built-in multi-language (`app/i18n/`) |
| Audio | ElevenLabs animal sound effects |

### 📂 Project Structure

```text
electron/
├── main.mjs             # Main process: window, embedded server, tray, IPC
├── preload.mjs          # Preload: custom titlebar injection, window controls
└── updater.mjs          # Auto-updater: check / download / install
app/                     # Next.js App Router
├── page.jsx             # Entry → Landing
├── Landing.jsx          # Team select, formation, difficulty, mode picker
├── layout.jsx           # Global layout, PWA metadata
├── lobby/               # LAN lobby: QR code, phone pairing
├── match/               # Match: Pixi canvas, HUD, touch, goal fx
├── pad/                 # LAN phone gamepad
├── online/              # Online room UI + client protocol + frame codec
├── online-pad/          # Online phone gamepad entry
├── lan/                 # LAN client protocol
├── ui/                  # Shared components: icons, kit, formation diagram
├── data/                # Game data: teams, players, formations
├── audio/               # SoundBank
├── i18n/                # Localization dictionaries
├── api/health/          # Health check endpoint
└── GameClient.jsx       # Pixi engine loader
cloudflare/
└── online-worker.js     # Durable Object room service
online/
└── shared.js            # Shared protocol & validation (Node & Worker)
public/
└── match-runtime-min/   # Pre-built match engine (closed-source)
script/                  # ~40 scripts: build, verify, asset-gen, relay services
.github/workflows/
└── build.yml            # CI: tag → 3-platform build → GitHub Releases
```

### 🛠 Development

```bash
pnpm install

# Start Next.js dev server (:13000)
pnpm dev

# Launch Electron (connects to the running dev server)
pnpm desktop

# LAN multiplayer dev (dev server + LAN relay)
pnpm dev:lan

# Online multiplayer dev (dev server + local room relay)
pnpm dev:online
```

In dev mode, Electron detects the unpackaged state, skips embedded server
startup, and connects to the external dev server. In production, it starts
all services automatically.

### 🔧 Build & Release

```bash
# Production build + package
pnpm desktop:build     # → dist-electron/*.dmg / *.exe / *.AppImage

# Build to directory only (no installer)
pnpm desktop:dir
```

**CI auto-release**: push a `v*` tag → GitHub Actions builds all three
platforms in parallel → publishes to GitHub Releases:

```bash
git tag v0.1.1
git push origin v0.1.1
```

**Online room service** (optional, only needed for online multiplayer):

```bash
pnpm deploy:online     # Deploy Durable Objects to Cloudflare
```

### 🧪 Testing

| Command | Description |
| --- | --- |
| `pnpm test:online` | Online room protocol verification (CLI) |
| `pnpm test:online:browser` | Chrome E2E: dual screens, touch, controllers, canvas (Playwright) |

### 📄 License

[Apache License 2.0](./LICENSE)
