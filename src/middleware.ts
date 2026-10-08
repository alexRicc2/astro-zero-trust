import { defineMiddleware } from 'astro:middleware';

function getStagingSecret(): string | undefined {
	const fromProcess = process.env.STAGING_SHARED_SECRET;
	if (fromProcess) return fromProcess;

	const fromImportMeta = import.meta.env.STAGING_SHARED_SECRET;
	return typeof fromImportMeta === 'string' && fromImportMeta.length > 0
		? fromImportMeta
		: undefined;
}

export const onRequest = defineMiddleware((context, next) => {
	const isStaging =
		import.meta.env.PUBLIC_SITE_ENV === 'staging' ||
		process.env.VERCEL_ENV === 'preview' ||
		import.meta.env.VERCEL_ENV === 'preview';

	if (!isStaging) {
		return next();
	}

	const expectedSecret = getStagingSecret();
	const token = context.request.headers.get('x-staging-auth-token');

	const reason = !expectedSecret
		? 'secret-missing'
		: !token
			? 'header-missing'
			: token !== expectedSecret
				? 'token-mismatch'
				: 'ok';

	console.log(
		JSON.stringify({
			msg: 'staging-auth',
			reason,
			path: context.url.pathname,
			hasHeader: Boolean(token),
			hasSecret: Boolean(expectedSecret),
			headerLen: token?.length ?? 0,
			secretLen: expectedSecret?.length ?? 0,
			vercelEnv: process.env.VERCEL_ENV ?? null,
		}),
	);

	const denyHeaders = {
		'x-staging-debug': reason,
		'cache-control': 'private, no-store, no-cache, must-revalidate',
	};

	if (reason === 'secret-missing') {
		return new Response('Configuração de segurança incompleta.', {
			status: 500,
			headers: denyHeaders,
		});
	}

	if (reason !== 'ok') {
		return new Response('Acesso direto proibido. Acesse via staging oficial.', {
			status: 403,
			headers: denyHeaders,
		});
	}

	return next();
});
