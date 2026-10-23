const UPSTREAM =
  'https://api.counterapi.dev/v2/codeine-castledecoygrenadegangs-team-6021/first-counter-6021';

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function pickCount(data) {
  if (!data || typeof data !== 'object') return null;
  const raw =
    data.count ??
    data.value ??
    (data.data && (data.data.count ?? data.data.value));
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
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

    const env = context.env || {};
    const key = env.COUNTER_API_KEY || env.PUBLIC_COUNTER_API_KEY;
    if (!key) {
      return json(
        {
          error: 'Counter not configured',
          hint: 'Set COUNTER_API_KEY in Cloudflare Pages Variables (Production) and Redeploy.',
          missing: ['COUNTER_API_KEY'],
        },
        503,
      );
    }

    const url = method === 'POST' ? UPSTREAM + '/up' : UPSTREAM + '/';
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + key,
        Accept: 'application/json',
      },
    });

    const text = await upstream.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      return json(
        {
          error: 'Upstream returned non-JSON',
          status: upstream.status,
          body: String(text).slice(0, 300),
        },
        502,
      );
    }

    if (!upstream.ok) {
      return json(
        {
          error: 'Upstream error',
          status: upstream.status,
          body: data,
        },
        502,
      );
    }

    const count = pickCount(data);
    if (count === null) {
      return json(
        { error: 'Unexpected counter payload', body: data },
        502,
      );
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
