import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {

	console.log({
    url: context.url.href,
    stagingHeader: context.request.headers.get('x-staging-auth-token'),
    cfAssertion: context.request.headers.get('cf-access-jwt-assertion'),
    expected: Boolean(import.meta.env.STAGING_SHARED_SECRET),
  });


	const isStaging =
		import.meta.env.PUBLIC_SITE_ENV === 'staging' || process.env.VERCEL_ENV === 'preview';

	// Se não estiver em staging, não executa checagem de token
	if (!isStaging) {
		return next();
	}

	const expectedSecret = import.meta.env.STAGING_SHARED_SECRET;
	const token = context.request.headers.get('x-staging-auth-token');

	if (!expectedSecret) {
		console.error('STAGING_SHARED_SECRET não está configurado.');
		return new Response('Configuração de segurança incompleta.', { status: 500 });
	}

	if (!token || token !== expectedSecret) {
		return new Response('Acesso direto proibido. Acesse via staging oficial.', {
			status: 403,
		});
	}

	return next();
});
