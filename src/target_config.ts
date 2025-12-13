/// <reference lib="dom" />

// Определяем окружение
const isTauriApp = typeof window !== 'undefined' && !!(window as any).__TAURI__;
const isDevelopment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.')
);
const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

export const api_proxy_addr = "http://192.168.1.17:8080"
export const img_proxy_addr = "http://192.168.1.17:9000"

export const dest_api = isTauriApp
    ? api_proxy_addr  // Для Tauri - прямой адрес
    : isGitHubPages
        ? api_proxy_addr  // Для GitHub Pages - прямой адрес к бэкенду
        : isDevelopment
            ? "/api"  // Для локальной разработки - через Vite proxy
            : api_proxy_addr;  // Для продакшн на других доменах

export const dest_img = isTauriApp
    ? img_proxy_addr
    : isGitHubPages
        ? img_proxy_addr
        : isDevelopment
            ? "/img-proxy"
            : img_proxy_addr;

export const dest_root = isTauriApp ? "" : "/Electromagnetic_radiation_front"

// Логирование для отладки
if (typeof window !== 'undefined') {
    console.log('Environment:', {
        isTauriApp,
        isDevelopment,
        isGitHubPages,
        hostname: window.location.hostname,
        dest_api,
        dest_img
    });
}