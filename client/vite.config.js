import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: '/methodics/',
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/methodics/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/methodics/, ''),
            },
        },
    },
})