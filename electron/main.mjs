// Electron main process for Animal Cup desktop app.
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  dialog,
} from "electron";
import { fork } from "child_process";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { initUpdater, downloadUpdate, installUpdate } from "./updater.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEV = !app.isPackaged;
// DEV: project root (electron/..). Packaged: Resources/app/ (electron/..)
const root = path.resolve(__dirname, "..");

const PORT = 13000;
const LAN_PORT = 13001;
const ONLINE_PORT = 13002;

let mainWindow = null;
let tray = null;
let serversStarted = false;
const children = [];

// ---- icon ----
const iconPath = path.join(__dirname, "icon.png");
let appIcon = null;
try {
  appIcon = nativeImage.createFromPath(iconPath);
} catch { /* fallback to default */ }

// ---- relay spawning ----
function spawnRelay(scriptPath, env = {}) {
  const child = fork(scriptPath, [], {
    cwd: root,
    env: { ...process.env, ...env },
    silent: true,
  });
  child.stdout?.on("data", (d) => process.stdout.write(`[relay] ${d}`));
  child.stderr?.on("data", (d) => process.stderr.write(`[relay] ${d}`));
  child.on("error", (err) => console.error("[relay] spawn error:", err.message));
  children.push(child);
  return child;
}

// ---- health check: poll /api/health until server is reachable ----
async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch { /* not ready yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

// ---- start Next.js + relays ----
async function startServers() {
  console.log("[desktop] Starting Next.js server...");
  const next = (await import("next")).default;
  const nextApp = next({ dev: false, dir: root, quiet: true });
  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();
  const server = createServer(handle);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[desktop] Next.js → http://localhost:${PORT}`);

  spawnRelay(path.join(root, "script", "lan-server.mjs"), {
    LAN_PORT: String(LAN_PORT),
  });
  spawnRelay(path.join(root, "script", "online-server.mjs"), {
    ONLINE_PORT: String(ONLINE_PORT),
  });

  const ready = await waitForServer(`http://localhost:${PORT}/api/health`);
  if (!ready) throw new Error("Server did not become ready within 30s");
  console.log("[desktop] Server health check OK");
}

// ---- window ----
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    title: "Animal Cup",
    icon: appIcon || undefined,
    show: false, // show only when ready-to-show fires
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Show window once the renderer is ready (avoids white flash)
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Handle page load failures
  mainWindow.webContents.on("did-fail-load", (_event, code, desc, url) => {
    console.error(`[desktop] Failed to load ${url}: ${code} ${desc}`);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (serversStarted) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
  }
}

// ---- window control IPC ----
function setupIPC() {
  ipcMain.on("win:minimize", () => mainWindow?.minimize());
  ipcMain.on("win:maximize", () => {
    if (!mainWindow) return;
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });
  ipcMain.on("win:close", () => mainWindow?.close());
  ipcMain.handle("win:isMaximized", () => mainWindow?.isMaximized() ?? false);

  ipcMain.handle("updater:download", () => downloadUpdate());
  ipcMain.handle("updater:install", () => installUpdate());
}

// ---- tray ----
function createTray() {
  if (!appIcon) return;
  const trayIcon = appIcon.resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);
  tray.setToolTip("Animal Cup");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Show",
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            createWindow();
          }
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          for (const child of children) child.kill();
          app.exit(0);
        },
      },
    ]),
  );
  tray.on("click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}

// ---- app lifecycle ----
async function main() {
  if (!DEV) {
    try {
      await startServers();
      serversStarted = true;
    } catch (err) {
      console.error("[desktop] Startup failed:", err);
      await app.whenReady();
      dialog.showErrorBox(
        "Animal Cup — Startup Error",
        `Failed to start the application server.\n\n${err.message}\n\nPlease reinstall the application.`,
      );
      app.quit();
      return;
    }
  } else {
    console.log("[desktop] Dev mode — start dev server yourself:");
    console.log("  pnpm dev:online");
    serversStarted = true; // assume external server
  }

  await app.whenReady();
  setupIPC();
  createWindow();
  createTray();

  if (!DEV) initUpdater(mainWindow);
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    for (const child of children) child.kill();
    app.quit();
  }
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});

app.on("before-quit", () => {
  for (const child of children) child.kill();
});

main();
