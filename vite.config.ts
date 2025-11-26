import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs'
import path from 'path'
import {api_proxy_addr, img_proxy_addr, dest_root} from "./target_config"

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    VitePWA({
  registerType: 'autoUpdate',
  devOptions: {
    enabled: true,
  },
  manifest:{
        "name": "Расчёт излучения приборов",
        "short_name": "RadiationCalc",
        "start_url": ".",
        "display": "standalone",
        "background_color": "#faf9f7",
        "theme_color": "#01A950",
        "lang": "ru",
        "scope": "/Electromagnetic_radiation_front/",
        "icons": [
          {
            "src": "icon-192.png",
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": "icon-512.png",
            "type": "image/png", 
            "sizes": "512x512"
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
    proxy: {
      "/api": {
        target: api_proxy_addr,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/"),
      },
      "/img-proxy": {
        target: img_proxy_addr,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/img-proxy/, "")
      },
    },
  },
  base: dest_root
})