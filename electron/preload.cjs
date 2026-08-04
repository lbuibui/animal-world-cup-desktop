// Preload script — injects custom title bar into the renderer and exposes
// IPC bridge for window controls. Runs with contextIsolation: true.
//
// NOTE: must stay CommonJS (.cjs). Electron 20+ sandboxes renderers by
// default, and sandboxed preloads have no ESM context — an `import` statement
// here is a SyntaxError that kills the whole script (no title bar, no window
// drag). See electronjs.org/docs/latest/tutorial/esm.
const { contextBridge, ipcRenderer } = require("electron");

const isMac = process.platform === "darwin";

// ---- window controls exposed to injected title bar ----
contextBridge.exposeInMainWorld("electronWindow", {
  minimize: () => ipcRenderer.send("win:minimize"),
  maximize: () => ipcRenderer.send("win:maximize"),
  close: () => ipcRenderer.send("win:close"),
  isMaximized: () => ipcRenderer.invoke("win:isMaximized"),
});

contextBridge.exposeInMainWorld("electronPlatform", { isMac });

// ---- inject custom title bar into the DOM ----
function injectTitleBar() {
  if (document.getElementById("electron-titlebar")) return;

  const bar = document.createElement("div");
  bar.id = "electron-titlebar";
  bar.innerHTML = isMac
    ? `<div class="eb-drag"></div>` // macOS: traffic lights in left inset
    : `<div class="eb-drag"><span class="eb-title">Animal Cup</span></div>
       <div class="eb-controls">
         <button id="eb-min" title="Minimize"><svg width="10" height="1"><rect width="10" height="1" fill="currentColor"/></svg></button>
         <button id="eb-max" title="Maximize"><svg width="10" height="10"><rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>
         <button id="eb-close" title="Close"><svg width="10" height="10"><line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" stroke-width="1.5"/></svg></button>
       </div>`;

  const css = document.createElement("style");
  css.textContent = [
    `#electron-titlebar{position:fixed;top:0;left:0;right:0;height:36px;background:#0b0b18;z-index:2147483647;display:flex;align-items:stretch;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;user-select:none;}`,
    `.eb-drag{flex:1;height:100%;-webkit-app-region:drag;display:flex;align-items:center;padding-left:${isMac ? "80px" : "14px"};}`,
    `.eb-title{font-weight:500;color:#ccc;letter-spacing:0.3px;}`,
    `.eb-controls{display:flex;height:100%;-webkit-app-region:no-drag;}`,
    `.eb-controls button{width:46px;height:100%;border:none;border-radius:0;background:transparent;color:#999;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .12s;}`,
    `.eb-controls button:hover{background:#2a2a3e;color:#eee;}`,
    `#eb-close:hover{background:#e81123!important;color:#fff;}`,
  ].join("\n");
  document.head.appendChild(css);

  if (document.body) {
    document.body.insertBefore(bar, document.body.firstChild);
  }

  // wire buttons
  const el = (id) => document.getElementById(id);
  if (el("eb-min")) el("eb-min").onclick = () => ipcRenderer.send("win:minimize");
  if (el("eb-max")) el("eb-max").onclick = () => ipcRenderer.send("win:maximize");
  if (el("eb-close")) el("eb-close").onclick = () => ipcRenderer.send("win:close");
}

// inject as early as possible
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectTitleBar);
} else {
  injectTitleBar();
}

// Next.js hydration can wipe <body> — re-inject if that happens
new MutationObserver(() => {
  if (!document.getElementById("electron-titlebar")) injectTitleBar();
}).observe(document.documentElement, { childList: true, subtree: true });
