// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "SplitAgent",
        short_name: "SplitAgent",
        description: "Gestão financeira inteligente para empresas, com previsões de fluxo de caixa, simulações de vendas e recomendações estratégicas.",
        theme_color: "#0F263B",
        background_color: "#0F263B",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/assets/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/assets/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/assets/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // Cache strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.myapp\.com\/.*/i,
            handler: "NetworkFirst",
            options: { cacheName: "api-cache", networkTimeoutSeconds: 10 }
          },
          {
            urlPattern: /\.(js|css|png|jpg|svg|woff2)$/,
            handler: "CacheFirst",
            options: { cacheName: "static-assets" }
          }
        ]
      }
    })
  ]
});