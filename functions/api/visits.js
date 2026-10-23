const UPSTREAM =
  'https://api.counterapi.dev/v2/codeine-castledecoygrenadegangs-team-6021/first-counter-6021';

function pickCount(data) {
  const raw =
    data?.count ??
    data?.value ??
    data?.data?.count ??
    data?.data?.value ??
    data?.Counter?.count;
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
      return Response.json(
        {
          error: 'Counter not configured',
          hint: 'Set COUNTER_API_KEY in Cloudflare Pages → Settings → Variables (Production), then Redeploy.',
          missing: ['COUNTER_API_KEY'],
        },
        { status: 503 },
      );
    }

    const url = method === 'POST' ? `${UPSTREAM}/up` : `${UPSTREAM}/`;
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    });

    const text = await upstream.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return Response.json(
        {
          error: 'Upstream returned non-JSON',
          status: upstream.status,
          body: text.slice(0, 300),
        },
        { status: 502 },
      );
    }

    if (!upstream.ok) {
      return Response.json(
        {
          error: 'Upstream error',
          status: upstream.status,
          body: data,
        },
        { status: 502 },
      );
    }

    const count = pickCount(data);
    if (count === null) {
      return Response.json(
        { error: 'Unexpected counter payload', body: data },
        { status: 502 },
      );
    }

    return Response.json({ count });
  } catch (err) {
    return Response.json(
      {
        error: 'Function error',
        message: err && err.message ? String(err.message) : String(err),
      },
      { status: 500 },
    );
  }
}
