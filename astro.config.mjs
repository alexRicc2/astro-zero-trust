// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Identifica se estamos em staging/preview
const isStaging =
	process.env.PUBLIC_SITE_ENV === 'staging' || process.env.VERCEL_ENV === 'preview';

// https://astro.build/config
export default defineConfig({
	// Static na main. Em staging precisa de server: com output static o middleware
	// roda no BUILD (sem o header), grava o 403 no HTML, e a Edge da Vercel
	// NÃO intercepta páginas prerenderizadas em request-time.
	output: isStaging ? 'server' : 'static',
	adapter: vercel({
		// Só injeta Edge Middleware na Vercel em builds de staging
		middlewareMode: isStaging ? 'edge' : 'classic',
	}),
});
