const KEY = 'count';

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequest(context) {
  try {
    const method = context.request.method;
    if (method !== 'GET' && method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, POST' },
      });
    }

    const kv = context.env && context.env.VISITS;
    if (!kv || typeof kv.get !== 'function') {
      return json(
        {
          error: 'Counter not configured',
          hint: 'Cloudflare Pages → Settings → Bindings → Add KV namespace binding named VISITS, then Redeploy.',
          missing: ['VISITS'],
        },
        503,
      );
    }

    const raw = await kv.get(KEY);
    let count = Number(raw);
    if (!Number.isFinite(count) || count < 0) count = 0;

    if (method === 'POST') {
      count += 1;
      await kv.put(KEY, String(count));
    }

    return json({ count }, 200);
  } catch (err) {
    return json(
      {
        error: 'Function error',
        message: err && err.message ? String(err.message) : String(err),
      },
      500,
    );
  }
}
