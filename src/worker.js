export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Intercept API routes
        if (url.pathname === '/api/stats') {
            const mode = url.searchParams.get('mode') || 'classic';
            const dateStr = url.searchParams.get('date');

            if (!dateStr) {
                return new Response(JSON.stringify({ error: 'Missing date parameter' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const kvKey = `stats_${mode}_${dateStr}`;

            if (request.method === 'GET') {
                let count = await env.ELDEN_STATS.get(kvKey);
                count = count ? parseInt(count, 10) : 0;

                return new Response(JSON.stringify({ mode, date: dateStr, count }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });

            } else if (request.method === 'POST') {
                let count = await env.ELDEN_STATS.get(kvKey);
                count = count ? parseInt(count, 10) : 0;
                count += 1;

                await env.ELDEN_STATS.put(kvKey, count.toString());

                return new Response(JSON.stringify({ mode, date: dateStr, count, success: true }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Default: serve static assets from Cloudflare Pages/Workers Assets
        // When running locally via Vite plugin, this might not be needed, but required for production.
        return env.ASSETS ? env.ASSETS.fetch(request) : new Response("ASSETS binding not found", { status: 404 });
    }
};
