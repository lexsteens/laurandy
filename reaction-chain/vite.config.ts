import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

function getLanIp(): string | null {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return null;
}

export default defineConfig(({ command }) => {
  const lanIp = command === 'serve' ? getLanIp() : null;
  return {
    plugins: [react()],
    define: {
      __LAN_ORIGIN__: JSON.stringify(lanIp ? `http://${lanIp}:5173` : null),
    },
  };
});
