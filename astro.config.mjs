// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Identifica se estamos em staging/preview
const isStaging =
	process.env.PUBLIC_SITE_ENV === 'staging' || process.env.VERCEL_ENV === 'preview';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: vercel({
		// Só injeta a camada de Edge Middleware na Vercel se for build de staging
		edgeMiddleware: isStaging,
	}),
});
