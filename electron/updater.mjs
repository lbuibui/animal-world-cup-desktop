// Auto-update via electron-updater. In dev (unpackaged) this is a no-op.
// In production it checks for updates from the configured feed URL and
// notifies the renderer when a new version is available.
import pkg from "electron-updater";
const { autoUpdater } = pkg;
import { BrowserWindow } from "electron";

// Override the default feed URL via env or here:
// autoUpdater.setFeedURL("https://updates.animalcup.ai/releases");

autoUpdater.autoDownload = false;
autoUpdater.allowDowngrade = false;

export function initUpdater(mainWindow) {
  if (!mainWindow) return;

  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("updater:available", info.version);
  });

  autoUpdater.on("update-downloaded", (info) => {
    mainWindow.webContents.send("updater:downloaded", info.version);
  });

  autoUpdater.on("error", (err) => {
    console.error("[updater]", err.message);
  });

  // Check after a short delay so the window is ready
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {
      // noop — server unreachable is normal
    });
  }, 5000);

  // Also check every 4 hours while the app is running
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 4 * 60 * 60 * 1000);
}

export function downloadUpdate() {
  autoUpdater.downloadUpdate().catch(() => {});
}

export function installUpdate() {
  autoUpdater.quitAndInstall();
}
