// Shared LAN IP picker for the relays and dev launchers.
// Virtual adapters (Docker, VM, VPN) are excluded: a Mac with Docker running
// would otherwise pick a 172.x bridge and produce a QR no phone can reach.
import os from "node:os";

const VIRTUAL_IFACE = /^(docker|veth|vmnet|vboxnet|bridge|br-|utun|tap|tun|tailscale)/;

export function lanIP(fallback = "127.0.0.1") {
  const ifaces = os.networkInterfaces();
  const candidates = []; // { addr, private }
  for (const name of Object.keys(ifaces)) {
    if (VIRTUAL_IFACE.test(name)) continue;
    for (const ni of ifaces[name] || []) {
      if (ni.family !== "IPv4" || ni.internal) continue;
      candidates.push({
        addr: ni.address,
        private: /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ni.address),
      });
    }
  }
  candidates.sort((a, b) => (b.private ? 1 : 0) - (a.private ? 1 : 0));
  return (candidates[0] && candidates[0].addr) || fallback;
}
