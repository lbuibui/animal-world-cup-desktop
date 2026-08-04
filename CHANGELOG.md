# Changelog

## 0.2.0 — 2026-08-04

### 🐛 修复

- **Electron 双开**:新增单实例锁,二次启动聚焦已有窗口,不再因端口占用报错退出
- **中继崩溃自愈**:LAN/公网 relay 子进程崩溃后 2s 自动重启(连续 5 次失败放弃),退出时不再误重启
- **LAN 中继加固**:`maxPayload` 64KB 上限 + 15s 心跳清理半开连接(断网手机不再悬挂)
- **联机协议 null 崩溃**:`sanitizeOnlineInput(null)` / `normalizeOnlineConfig(null)` 抛 TypeError 可致 relay 进程崩溃,已加守卫
- **本地与 Cloudflare relay 协议漂移**:direct 模式手柄加入逻辑已同步(两处实现保持 `KEEP IN SYNC`)
- **消息限速误杀**:90 msg/s → 200(2 手柄 + 1 屏幕 @30FPS 即 90/s,任何抖动即断开),常量统一到 `online/shared.js`
- **本地 relay 房间上限**:新增 `MAX_ROOMS = 2000`,超限返回 503
- **局域网 IP 选择**:排除虚拟网卡(Docker/VM/VPN),多网卡时优先私有网段;三处重复实现合并为 `script/net-ip.mjs`
- **公网邀请链接指向 localhost**:本地 relay 下发局域网 IP,邀请链接/手柄 QR 改用 `http://<lan-ip>:13000`;公网场景行为不变
- **Cloudflare DO 就近路由**:`locationHint` 硬编码 `apac` → `nearest`

### 🔒 安全

- **依赖漏洞升级**:`ws` 8.20.1(内存耗尽 DoS)→ 8.21.1(全链 overrides 强制);`next` 15.5.19(SSRF×2 + DoS)→ 15.5.21;`electron` 33 → 43.2.0;`electron-builder` 25 → 26.15.3
- **Origin 白名单**:公网/本机域名精确匹配 + 私有网段放行(桌面版从任意 LAN IP 打开),恶意 origin 拒绝

### ⚙️ 工程

- **公网联机全链路配置**:部署中继 `animal-cup-online.linyuan.uk`(Worker + Durable Objects)与网页版 `animal-cup.linyuan.uk`(OpenNext);`.env.local` 与 CI(`build.yml`)注入 `NEXT_PUBLIC_ONLINE_SERVICE_URL` / `NEXT_PUBLIC_APP_URL`,三端构建行为一致
- **字体本地化**:Titan One + Baloo 2 自托管,桌面应用零 Google Fonts 外网依赖,完全离线可用
- **删除过时 workaround**:`script/safe-build.mjs`(Next 15.5.19 专属 bug)已删,`build` 直接 `next build`
- **测试**:新增 `script/verify-shared.mjs`(`pnpm test:shared`,协议校验单测),CI 纳入
- **i18n**:手柄状态页硬编码双语 → `useLocale`(6 语言补 `pad.status.*` keys)
- **配置清理**:`wrangler*.toml` 域名/白名单注释说明;`.env.example` 完整部署步骤;`metadata.json` 标点修复

## 0.1.0 — 2026-07-25

初始版本:Electron 桌面壳 + Next.js 15 + Pixi 闭源引擎,支持单机观战/操控、局域网手机手柄对战、公网联机(Cloudflare Workers + Durable Objects),三平台打包与 GitHub Releases 自动发布。
