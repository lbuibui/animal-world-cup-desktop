<div align="center">

# 🐾 Animal Cup Desktop

**AI 动物足球模拟器 · 桌面版**

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
> 使用 **Pi-Coding-Agent** 对 [animal-world-cup](https://github.com/NeoXu954/animal-world-cup)
> 进行二次开发并开源。

### 🎮 简介

Animal Cup 灵感来自经典街机足球游戏。你可以从 8 支动物国家队中选择队伍、设置阵型，观看 AI 模拟比赛，也可以使用键盘、触屏或手机手柄亲自操控。

作为桌面应用，它开箱即用，无需浏览器、无需部署——安装后即可享受完整的单机、局域网、公网对战体验，并支持自动更新。

### 📦 下载安装

从 [GitHub Releases](https://github.com/lbuibui/animal-world-cup-desktop/releases) 下载最新版本：

| 平台 | 安装包 |
| --- | --- |
| **macOS** | `Animal-Cup-{version}-arm64.dmg` |
| **Windows** | `Animal-Cup-Setup-{version}.exe` |
| **Linux** | `Animal-Cup-{version}.AppImage` |

应用内置自动更新，安装后无需手动检查新版本。

### 🕹 四种游戏模式

| 模式 | 说明 |
| --- | --- |
| 本地单人 | AI 观战或键盘 / 触屏操控 |
| 局域网对战 | 大屏运行比赛 + 手机扫码作为无线手柄 |
| 公网联机 | 邀请制房间，双方直接操控或各自手机手柄 |
| 手机手柄 | 局域网 / 公网模式下，手机浏览器扫码即连 |

### 🏗 架构

```text
┌─────────────────────────────────────────────────┐
│                  Electron 桌面壳                  │
│  ┌─────────────────────────────────────────────┐│
│  │             Next.js 15 内嵌服务              ││
│  │  Landing → Lobby → Match (Pixi.js 引擎)      ││
│  │         Pad / OnlinePad (手机手柄)           ││
│  ├─────────────────────────────────────────────┤│
│  │  局域网中继 (ws)  │  公网中继 (本地开发)      ││
│  └─────────────────────────────────────────────┘│
│              无边框窗口 + 系统托盘                │
└─────────────────────────────────────────────────┘
                      │
                      ▼ 公网生产环境
┌─────────────────────────────────────────────────┐
│  Cloudflare Workers + Durable Objects (房间服务)  │
└─────────────────────────────────────────────────┘
```

- **桌面端**：Electron 无边框窗口，内嵌 Next.js 生产服务器 + LAN/Online 中继进程，纯离线可用（单机 + 局域网）
- **局域网**：主机浏览器运行比赛模拟，手机通过 WebSocket 中继发送输入
- **公网**：房主浏览器运行唯一比赛模拟，对手接收 ~30 FPS 二进制帧；服务端负责房间管理、输入和帧中继。6 位邀请码 + 恢复令牌

### 🚀 技术栈

| 层级 | 技术 |
| --- | --- |
| 桌面壳 | Electron 33 + electron-builder + electron-updater |
| 前端 | Next.js 15（App Router）+ React 19 |
| 比赛引擎 | 预构建 Pixi.js 运行时（`public/match-runtime-min/`） |
| 多人对战 | 主机权威架构 — WebSocket 中继 (`ws`) + 公网帧同步 |
| 公网服务 | Cloudflare Workers + Durable Objects |
| 测试 | Playwright（E2E）+ 命令行协议验证 |
| 国际化 | 内置多语言（`app/i18n/`） |
| 音频 | ElevenLabs 动物音效 |

### 📂 项目结构

```text
app/                     # Next.js App Router
├── api/health/          # 健康检查
├── audio/               # 音效资源和 SoundBank
├── data/                # 队伍、球员、阵型
├── i18n/                # 多语言文案
├── lan/                 # 局域网对战
├── lobby/               # 大厅（选队、阵型、队服）
├── match/               # 比赛页面（Pixi、触控、事件、特效）
├── online/              # 公网房间 UI + 协议 + 帧编解码
├── online-pad/          # 公网手机手柄入口
├── pad/                 # 局域网手机手柄
├── ui/                  # 通用 UI 组件
├── GameClient.jsx       # 游戏引擎加载器
├── Landing.jsx          # 落地页
└── layout.jsx           # 全局布局
electron/
├── main.mjs             # 主进程（窗口 + 托盘 + 内嵌服务）
├── preload.mjs          # 预加载脚本
└── updater.mjs          # 自动更新
public/
└── match-runtime-min/   # 预构建比赛引擎（闭源）
cloudflare/
└── online-worker.js     # Durable Object 房间服务
online/
└── shared.js            # Node / Worker 共用协议
script/                  # 构建、验证、资源生成脚本（~40 个）
```

### 🛠 开发指南

推荐使用 pnpm：

```bash
pnpm install

# 启动 Next.js dev server（端口 13000）
pnpm dev

# 启动 Electron 开发模式（连接上一步的 dev server）
pnpm desktop

# 局域网对战开发
pnpm dev:lan

# 公网联机开发（含本地房间中继）
pnpm dev:online
```

### 🔌 端口规划

| 端口 | 服务 |
| --- | --- |
| 13000 | Next.js 应用 |
| 13001 | 局域网 WebSocket 中继 |
| 13002 | 公网房间中继（开发）/ Durable Objects（生产） |

### 🔧 构建与发布

```bash
# 生产构建 + 打包安装文件（DMG / NSIS / AppImage）
pnpm desktop:build

# 仅输出应用目录，不打包
pnpm desktop:dir
```

**CI 自动发布**：推送 `v*` tag 触发 GitHub Actions 自动构建三平台安装包并发布到 GitHub Releases：

```bash
git tag v0.1.1
git push origin v0.1.1
```

用户安装后通过 electron-updater 自动检测和下载更新。

**公网房间服务部署**（可选，桌面应用在局域网/单机模式无需此步骤）：

```bash
# 修改 wrangler-online.toml 中的 ALLOWED_ORIGINS
pnpm deploy:online
```

### 🧪 测试

| 命令 | 说明 |
| --- | --- |
| `pnpm test:online` | 公网房间协议验证（命令行） |
| `pnpm test:online:browser` | Chrome E2E：双屏、触控、手柄、画布渲染（Playwright） |

### 🎨 资源管线

`script/` 目录包含约 40 个素材生成脚本，覆盖球员肖像、球迷精灵、裁判、足球图标、草地纹理、球场样式、ElevenLabs 动物音效、比赛 HUD 等。

### 🛠 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm desktop` | Electron 开发模式 |
| `pnpm desktop:build` | 生产构建 + 打包 |
| `pnpm desktop:dir` | 生产构建（仅目录） |
| `pnpm dev:lan` | 局域网对战开发 |
| `pnpm dev:online` | 公网联机开发 |
| `pnpm test:online` | 公网协议验证 |
| `pnpm test:online:browser` | 浏览器 E2E 测试 |
| `pnpm deploy:online` | 部署 Cloudflare 房间服务 |
| `pnpm build` | Next.js 生产构建 |
| `pnpm start` | Next.js 生产模式运行 |

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
national teams, set your formation, watch an AI-simulated 7v7 match, or take
control with a keyboard, touchscreen, or phone gamepad.

As a desktop app, it works out of the box—no browser, no deployment. Install
and enjoy solo, LAN, and online multiplayer right away, with automatic updates.

### 📦 Download

Get the latest version from [GitHub Releases](https://github.com/lbuibui/animal-world-cup-desktop/releases):

| Platform | Installer |
| --- | --- |
| **macOS** | `Animal-Cup-{version}-arm64.dmg` |
| **Windows** | `Animal-Cup-Setup-{version}.exe` |
| **Linux** | `Animal-Cup-{version}.AppImage` |

The app updates itself automatically—no need to check for new versions.

### 🕹 Four Game Modes

| Mode | Description |
| --- | --- |
| Local solo | AI spectator or keyboard / touch controls |
| LAN multiplayer | Shared big screen + phones as wireless gamepads via QR code |
| Online multiplayer | Invite-only rooms, direct controls or phone controllers per side |
| Phone gamepad | Scan QR in LAN / online mode, phone becomes a wireless controller |

### 🏗 Architecture

```text
┌─────────────────────────────────────────────────┐
│                Electron Desktop Shell             │
│  ┌─────────────────────────────────────────────┐│
│  │           Embedded Next.js 15 Server         ││
│  │  Landing → Lobby → Match (Pixi.js engine)    ││
│  │         Pad / OnlinePad (phone controllers)  ││
│  ├─────────────────────────────────────────────┤│
│  │  LAN relay (ws)    │  Online relay (dev)     ││
│  └─────────────────────────────────────────────┘│
│          Frameless window + System tray          │
└─────────────────────────────────────────────────┘
                      │
                      ▼ Production online
┌─────────────────────────────────────────────────┐
│  Cloudflare Workers + Durable Objects (rooms)    │
└─────────────────────────────────────────────────┘
```

- **Desktop**: Electron frameless window, embeds Next.js production server + all relay processes; fully offline-capable (solo + LAN)
- **LAN**: host browser runs the match sim, phones send input via WebSocket relay
- **Online**: host browser runs the only simulation, opponent receives ~30 FPS binary frames; server handles rooms, auth, input, and frame relay. 6-character room codes with recovery tokens

### 🚀 Tech Stack

| Layer | Technology |
| --- | --- |
| Desktop shell | Electron 33 + electron-builder + electron-updater |
| Frontend | Next.js 15 (App Router) + React 19 |
| Match engine | Pre-built Pixi.js runtime (`public/match-runtime-min/`) |
| Multiplayer | Host-authoritative — WebSocket relay (`ws`) + online frame sync |
| Online service | Cloudflare Workers + Durable Objects |
| Testing | Playwright (E2E) + CLI protocol verification |
| i18n | Built-in multi-language (`app/i18n/`) |
| Audio | ElevenLabs animal sound effects |

### 📂 Project Structure

```text
app/                     # Next.js App Router
├── api/health/          # Health check
├── audio/               # Sound effects & SoundBank
├── data/                # Teams, players, formations
├── i18n/                # Localized strings
├── lan/                 # LAN multiplayer
├── lobby/               # Lobby (team select, formation, kit)
├── match/               # Match page (Pixi, touch, events, fx)
├── online/              # Online room UI + protocol + frame codec
├── online-pad/          # Online phone-controller entry
├── pad/                 # LAN phone gamepad
├── ui/                  # Shared UI components
├── GameClient.jsx       # Game engine loader
├── Landing.jsx          # Landing page
└── layout.jsx           # Global layout
electron/
├── main.mjs             # Main process (window + tray + embedded server)
├── preload.mjs          # Preload script
└── updater.mjs          # Auto-updater
public/
└── match-runtime-min/   # Pre-built match engine (closed-source)
cloudflare/
└── online-worker.js     # Durable Object room service
online/
└── shared.js            # Shared protocol (Node & Worker)
script/                  # Build, verification, asset-gen scripts (~40 files)
```

### 🛠 Development

pnpm is recommended:

```bash
pnpm install

# Start Next.js dev server (port 13000)
pnpm dev

# Launch Electron in dev mode (connects to the dev server above)
pnpm desktop

# LAN multiplayer development
pnpm dev:lan

# Online multiplayer development (with local room relay)
pnpm dev:online
```

### 🔌 Port Map

| Port | Service |
| --- | --- |
| 13000 | Next.js app |
| 13001 | LAN WebSocket relay |
| 13002 | Online room relay (dev) / Durable Objects (prod) |

### 🔧 Build & Release

```bash
# Production build + package (DMG / NSIS / AppImage)
pnpm desktop:build

# Build to directory only (no installer)
pnpm desktop:dir
```

**CI auto-release**: push a `v*` tag to trigger GitHub Actions building all three platforms and publishing to GitHub Releases:

```bash
git tag v0.1.1
git push origin v0.1.1
```

Installed apps auto-update via electron-updater.

**Online room service deployment** (optional; not needed for solo/LAN mode):

```bash
# Update ALLOWED_ORIGINS in wrangler-online.toml first
pnpm deploy:online
```

### 🧪 Testing

| Command | Description |
| --- | --- |
| `pnpm test:online` | Online room protocol verification (CLI) |
| `pnpm test:online:browser` | Chrome E2E: dual screens, touch, controllers, canvas (Playwright) |

### 🎨 Asset Pipeline

The `script/` directory contains ~40 asset-generation scripts covering player portraits, crowd sprites, referee, ball icons, grass textures, stadium styling, ElevenLabs animal sound effects, match HUD, and more.

### 🛠 Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm desktop` | Electron dev mode |
| `pnpm desktop:build` | Production build + package |
| `pnpm desktop:dir` | Production build (directory only) |
| `pnpm dev:lan` | LAN multiplayer dev |
| `pnpm dev:online` | Online multiplayer dev |
| `pnpm test:online` | Online protocol verification |
| `pnpm test:online:browser` | Browser E2E test |
| `pnpm deploy:online` | Deploy Cloudflare room service |
| `pnpm build` | Next.js production build |
| `pnpm start` | Next.js production mode |

### 📄 License

[Apache License 2.0](./LICENSE)
