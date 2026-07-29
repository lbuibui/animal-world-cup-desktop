<div align="center">

# 🐾 Animal Cup — AI 动物足球模拟器

**AI Animal Football Simulator**

从 8 支动物国家队中挑选你的队伍，排布阵型，观看或亲自操控 7v7 足球赛事，并通过局域网或公网与朋友对战。

Pick from 8 animal national teams, set your formation, watch or control a 7v7 match, and play with friends over LAN or the public internet.

[English](#english) · [中文](#中文)

</div>

---

<a name="中文"></a>

## 中文

> **项目来源**
> 本项目基于 [HappySeeds](https://happyseeds.ai/) 平台上的原创作品
> [Animal Cup](https://app-ce3abc4512.happyseeds.space/) Remix 后，
> 使用 **Pi-Coding-Agent** 对[animal-world-cup](https://github.com/NeoXu954/animal-world-cup)进行二次开发并开源。

### 🎮 简介

Animal Cup 灵感来自经典街机足球游戏。你可以从 8 支动物国家队中选择队伍、设置阵型，观看 AI 模拟比赛，也可以使用键盘、触屏或手机手柄亲自操控。

支持 **四种运行模式**：

| 模式 | 说明 |
| --- | --- |
| 本地单人 | 浏览器中运行，AI 观战或键盘/触屏操控 |
| 局域网对战 | 大屏运行比赛 + 手机扫码作为无线手柄 |
| 公网联机 | 邀请制房间，支持双方直接操控或各自手机手柄 |
| 桌面应用 | Electron 打包，无边框窗口 + 系统托盘 |

### 🏗 架构概览

```text
┌──────────────────────────────────────────────────┐
│                   Next.js 15                      │
│  Landing → Lobby → Match (Pixi.js runtime)        │
│           Pad (手机手柄) / OnlinePad (公网手柄)     │
├──────────────────────────────────────────────────┤
│  局域网层          │  公网层                        │
│  script/lan-server │  cloudflare/online-worker     │
│  (WebSocket 中继)  │  (Durable Objects 房间服务)    │
│                    │  online/shared (共享协议)      │
├──────────────────────────────────────────────────┤
│  Electron (桌面端) — 内嵌 Next.js + 中继服务        │
└──────────────────────────────────────────────────┘
```

- **局域网**：主机浏览器运行比赛模拟，手机通过 WebSocket 中继发送输入
- **公网**：房主浏览器运行唯一比赛模拟，对手接收 ~30 FPS 二进制帧；服务端只负责房间管理、输入和帧中继。6 位邀请码 + 恢复令牌
- **桌面端**：Electron 内启动 Next.js production server + LAN/Online 中继，纯离线可用（单机 + 局域网）

### 🔌 端口规划

| 端口 | 服务 |
| --- | --- |
| 13000 | Next.js 应用 |
| 13001 | 局域网 WebSocket 中继 |
| 13002 | 公网房间中继（开发）/ Durable Objects（生产） |

### 🚀 技术栈

- **前端框架**：Next.js 15（App Router）+ React 19
- **比赛引擎**：预构建的 Pixi.js 运行时（`public/match-runtime-min/`）
- **多人对战**：主机权威架构 — 局域网 WebSocket 中继 (`ws`) + 公网帧同步
- **公网服务**：Cloudflare Workers + Durable Objects（OpenNext 构建）
- **桌面端**：Electron 33 + electron-builder（支持 macOS / Windows / Linux）
- **测试**：Playwright（浏览器端 E2E）+ 命令行协议验证脚本
- **国际化**：内置多语言支持（`app/i18n/`）
- **音频**：ElevenLabs 生成的动物音效（`app/audio/`）

### 📂 项目结构

```text
app/                     # Next.js App Router (~6,800 行)
├── api/health/          # 健康检查端点
├── audio/               # 音效资源和 SoundBank
├── data/                # 队伍、球员、阵型等游戏数据
├── i18n/                # 多语言文案和语言切换
├── lan/                 # 局域网对战页面 + 客户端协议
├── lobby/               # 大厅（选队、排阵型、队服预览）
├── match/               # 比赛页面（Pixi 画布、触控、事件、特效）
├── online/              # 公网房间 UI + 客户端协议 + 帧编解码
├── online-pad/          # 公网手机手柄入口
├── pad/                 # 局域网手机手柄页面
├── ui/                  # 通用 UI 组件（图标、队服、阵型图）
├── GameClient.jsx       # 游戏客户端入口
├── Landing.jsx          # 落地页
└── layout.jsx           # 全局布局
public/
└── match-runtime-min/   # 预构建的比赛引擎（Pixi 运行时，闭源）
cloudflare/
└── online-worker.js     # Durable Object 公网房间服务（~430 行）
online/
└── shared.js            # Node / Worker 共用的协议定义与数据校验
electron/
├── main.mjs             # Electron 主进程（无边框窗口 + 托盘）
├── preload.mjs          # 预加载脚本（context bridge）
└── updater.mjs          # 自动更新（GitHub Releases）
script/                  # 构建、验证、资源生成、本地中继脚本（~40 个）
```

### 🕹 快速开始

推荐使用 pnpm（仓库已附带 `pnpm-lock.yaml`）：

```bash
# 安装依赖
pnpm install

# 启动开发服务器（端口 13000）
pnpm dev
```

打开 `http://localhost:13000` 即可。

**局域网多人对战：**

```bash
pnpm dev:lan
```

比赛在共享大屏上运行，手机扫码后作为无线手柄接入。

**公网多人对战：**

```bash
pnpm dev:online
```

公网模式共用一套主机权威房间系统：

- **直接操控对战**：房主和对手分别在自己的浏览器中使用键盘或触屏操作。
- **在线手机手柄对战**：两边各使用一块比赛屏幕，并用各自手机扫码作为 P1 / P2 手柄。

创建者浏览器运行唯一的比赛模拟，对手屏幕接收约 30 FPS 的二进制比赛帧；公网服务只负责房间、鉴权、输入和帧中继。房间使用 6 位邀请码，并为房主、对手屏幕和 P1/P2 手柄分别保存恢复令牌。

**桌面应用：**

```bash
# 开发模式（需要先启动 dev:online）
pnpm desktop

# 生产构建 + 打包（DMG / NSIS / AppImage）
pnpm desktop:build

# 仅构建到目录（不打包安装文件）
pnpm desktop:dir
```

桌面端使用无边框窗口 + 系统托盘，内嵌 Next.js 生产服务器和全部中继服务。

公网房间是邀请制休闲对战，目前不包含账号、自动匹配、排行榜或服务端防作弊。

### 🌐 生产部署

```bash
# 1. 将 wrangler-online.toml 的 ALLOWED_ORIGINS 改为正式网页域名
# 2. 部署公网房间 Worker
pnpm deploy:online

# 3. 将返回的 Worker 地址写入 .env.local
cp .env.example .env.local
# NEXT_PUBLIC_ONLINE_SERVICE_URL=https://<your-worker>.workers.dev

# 4. 重新构建并部署网页
pnpm build
```

### 🧪 测试

| 命令 | 说明 |
| --- | --- |
| `pnpm test:online` | 验证公网房间、输入和帧转发协议（命令行） |
| `pnpm test:online:browser` | Chrome 浏览器端 E2E：双屏、触控、手柄和画布渲染（Playwright） |

另有 `verify-match-boot.mjs` 和 `verify-i18n.mjs` 用于比赛启动和国际化完整性检查。

### 🛠 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器（端口 13000） |
| `pnpm dev:lan` | 启动带局域网对战的开发服务器 |
| `pnpm lan` | 单独启动局域网中继服务 |
| `pnpm dev:online` | 启动网页和本地公网房间中继 |
| `pnpm online` | 单独启动本地公网房间中继 |
| `pnpm desktop` | 启动 Electron 桌面应用（开发模式） |
| `pnpm desktop:build` | 生产构建 + 打包桌面安装文件 |
| `pnpm desktop:dir` | 生产构建 + 输出桌面应用目录（不打包） |
| `pnpm test:online` | 验证公网房间、输入和帧转发协议 |
| `pnpm test:online:browser` | 使用 Chrome 验证双屏、触控、手柄和画布渲染 |
| `pnpm deploy:online` | 部署 Cloudflare Durable Object 房间服务 |
| `pnpm build` | 生产构建（标准 Next.js） |
| `pnpm build:worker` | 构建 Cloudflare Workers 版本（OpenNext） |
| `pnpm start` | 运行生产构建 |

### 🎨 资源管线

`script/` 目录包含约 40 个素材生成脚本，覆盖：

- 球员肖像、球迷精灵、裁判、足球图标生成
- 草地纹理绘制、球场样式重绘
- ElevenLabs 动物音效生成
- 比赛 HUD、UI 组件视觉素材

这些脚本用于从源素材重建游戏运行时所需的所有视觉和音频资产。

### 📄 许可证

本项目基于 [Apache License 2.0](./LICENSE) 开源。

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
national teams, set your formation, watch an AI-simulated 7v7 match, or take
control with a keyboard, touchscreen, or phone gamepad.

**Four run modes**:

| Mode | Description |
| --- | --- |
| Local solo | Browser-based, AI spectator or keyboard/touch controls |
| LAN multiplayer | Shared big screen + phones as wireless gamepads via QR code |
| Online multiplayer | Invite-only rooms, direct controls or phone controllers on each side |
| Desktop app | Electron with frameless window + system tray |

### 🏗 Architecture

```text
┌──────────────────────────────────────────────────┐
│                   Next.js 15                      │
│  Landing → Lobby → Match (Pixi.js runtime)        │
│           Pad / OnlinePad (phone controllers)      │
├──────────────────────────────────────────────────┤
│  LAN layer           │  Online layer               │
│  script/lan-server    │  cloudflare/online-worker   │
│  (WebSocket relay)    │  (Durable Objects rooms)    │
│                       │  online/shared (protocol)   │
├──────────────────────────────────────────────────┤
│  Electron (desktop) — embedded Next.js + relays    │
└──────────────────────────────────────────────────┘
```

- **LAN**: host browser runs the match sim, phones send input via WebSocket relay
- **Online**: host browser runs the only simulation, opponent receives ~30 FPS binary frames; server handles rooms, auth, input, and frame relay. 6-digit room codes with recovery tokens
- **Desktop**: Electron embeds a Next.js production server + all relays; offline-capable (solo + LAN)

### 🔌 Port map

| Port | Service |
| --- | --- |
| 13000 | Next.js app |
| 13001 | LAN WebSocket relay |
| 13002 | Online room relay (dev) / Durable Objects (prod) |

### 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Match Engine**: Pre-built Pixi.js runtime (`public/match-runtime-min/`)
- **Multiplayer**: Host-authoritative — LAN WebSocket relay (`ws`) + online frame sync
- **Online service**: Cloudflare Workers + Durable Objects (OpenNext build)
- **Desktop**: Electron 33 + electron-builder (macOS / Windows / Linux)
- **Testing**: Playwright (browser E2E) + CLI protocol verification scripts
- **i18n**: Built-in multi-language support (`app/i18n/`)
- **Audio**: ElevenLabs-generated animal sound effects (`app/audio/`)

### 📂 Project Structure

```text
app/                     # Next.js App Router (~6,800 lines)
├── api/health/          # Health check endpoint
├── audio/               # Sound effects and SoundBank
├── data/                # Game data (teams, players, formations)
├── i18n/                # Localized strings and language switcher
├── lan/                 # LAN multiplayer page + client protocol
├── lobby/               # Lobby (team select, formation, kit preview)
├── match/               # Match page (Pixi canvas, touch, events, fx)
├── online/              # Public room UI + client protocol + frame codec
├── online-pad/          # Public phone-controller entry
├── pad/                 # LAN phone gamepad page
├── ui/                  # Shared UI components (icons, kit, formation diagram)
├── GameClient.jsx       # Game client entry
├── Landing.jsx          # Landing page
└── layout.jsx           # Global layout
public/
└── match-runtime-min/   # Pre-built match engine (Pixi runtime, closed-source)
cloudflare/
└── online-worker.js     # Durable Object public-room service (~430 lines)
online/
└── shared.js            # Protocol & validation shared by Node and Workers
electron/
├── main.mjs             # Electron main process (frameless window + tray)
├── preload.mjs          # Preload script (context bridge)
└── updater.mjs          # Auto-updater (GitHub Releases)
script/                  # Build, verification, asset-gen, and local relay scripts (~40 files)
```

### 🕹 Quick Start

pnpm is recommended (a `pnpm-lock.yaml` is shipped):

```bash
# Install dependencies
pnpm install

# Start the dev server (port 13000)
pnpm dev
```

Open `http://localhost:13000`.

**LAN multiplayer:**

```bash
pnpm dev:lan
```

The match runs on a shared big screen; phones scan a QR code to join as
wireless gamepads.

**Public online multiplayer:**

```bash
pnpm dev:online
```

Both public modes share one host-authoritative room service:

- **Direct controls**: the host and guest use keyboard or touch controls in their own browsers.
- **Online phone controllers**: each side has a match screen and pairs a phone as its P1 / P2 controller.

The creator's browser runs the only match simulation. The opponent screen
receives binary match frames at about 30 FPS, while the public service only
relays room state, authenticated input, and frames. Six-character room codes
are backed by separate recovery tokens for the host, opponent screen, and P1/P2
controllers.

**Desktop app:**

```bash
# Dev mode (requires dev:online running first)
pnpm desktop

# Production build + package (DMG / NSIS / AppImage)
pnpm desktop:build

# Build to directory only (no installer)
pnpm desktop:dir
```

The desktop app uses a frameless window + system tray and embeds the Next.js
production server and all relays.

Public rooms are intended for invite-only casual play. Accounts, automatic
matchmaking, rankings, and server-side anti-cheat are not included.

### 🌐 Production Deployment

1. Set `ALLOWED_ORIGINS` in `wrangler-online.toml` to the deployed web origin.
2. Run `pnpm deploy:online` to deploy the Durable Object room service.
3. Put the returned Worker URL in `.env.local` as `NEXT_PUBLIC_ONLINE_SERVICE_URL`.
4. Run `pnpm build`, then deploy the web application.

### 🧪 Testing

| Command | Description |
| --- | --- |
| `pnpm test:online` | Verify room, input, and frame relay protocol (CLI) |
| `pnpm test:online:browser` | Chrome E2E: dual screens, touch, controllers, canvas rendering (Playwright) |

Additional scripts `verify-match-boot.mjs` and `verify-i18n.mjs` check match
boot and i18n completeness.

### 🛠 Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (port 13000) |
| `pnpm dev:lan` | Dev server with LAN multiplayer |
| `pnpm lan` | Start the LAN relay server standalone |
| `pnpm dev:online` | Dev server with public online rooms |
| `pnpm online` | Start the local public-room relay |
| `pnpm desktop` | Launch Electron desktop app (dev mode) |
| `pnpm desktop:build` | Production build + package desktop installer |
| `pnpm desktop:dir` | Production build + output desktop app directory (no packaging) |
| `pnpm test:online` | Verify room, input, and frame relay behavior |
| `pnpm test:online:browser` | Verify dual screens, touch, controllers, and canvas rendering in Chrome |
| `pnpm deploy:online` | Deploy the Durable Object room service |
| `pnpm build` | Production build (standard Next.js) |
| `pnpm build:worker` | Build for Cloudflare Workers (OpenNext) |
| `pnpm start` | Run the production build |

### 🎨 Asset Pipeline

The `script/` directory contains ~40 asset-generation scripts, covering:

- Player portraits, crowd sprites, referee, and ball/football icon generation
- Grassland texture painting and stadium styling
- ElevenLabs animal sound effect generation
- Match HUD and UI component visual assets

These scripts rebuild all visual and audio assets required by the game runtime
from source materials.

### 📄 License

Released under the [Apache License 2.0](./LICENSE).
