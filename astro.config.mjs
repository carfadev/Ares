// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
	vite: {
		plugins: [
			tailwindcss(),
			VitePWA({
				registerType: 'autoUpdate',
				devOptions: {
					enabled: true,
				},
				includeAssets: [
					'favicon.svg',
					'favicon.ico',
					'icons/icon-192.png',
					'icons/icon-512.png',
					'apple-touch-icon.png',
				],
				manifest: {
					id: '/',
					name: 'Ares',
					short_name: 'Ares',
					description: 'Aplicación Ares instalada como PWA.',
					start_url: '/',
					scope: '/',
					display: 'standalone',
					background_color: '#020617',
					theme_color: '#020617',
					icons: [
						{
							src: '/icons/icon-192.png',
							sizes: '192x192',
							type: 'image/png',
							purpose: 'any',
						},
						{
							src: '/icons/icon-512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any maskable',
						},
						{
							src: '/apple-touch-icon.png',
							sizes: '180x180',
							type: 'image/png',
							purpose: 'any',
						},
					],
				},
			}),
		],
	},
});
