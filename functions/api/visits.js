const COUNTER_API_BASE = 'https://api.counterapi.dev/v2';
const DEFAULT_WORKSPACE = 'codeine-castledecoygrenadegangs-team-6021';
const DEFAULT_NAME = 'first-counter-6021';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function parseCount(data) {
  const raw =
    data?.count ?? data?.value ?? data?.data?.count ?? data?.data?.value;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

function getConfig(env = {}) {
  const key = env.COUNTER_API_KEY || env.PUBLIC_COUNTER_API_KEY || '';
  const workspace =
    env.COUNTER_WORKSPACE ||
    env.PUBLIC_COUNTER_WORKSPACE ||
    DEFAULT_WORKSPACE;
  const name = env.COUNTER_NAME || env.PUBLIC_COUNTER_NAME || DEFAULT_NAME;

  const missing = [];
  if (!key) missing.push('COUNTER_API_KEY');

  if (missing.length) {
    return {
      ok: false,
      missing,
      has: {
        COUNTER_API_KEY: Boolean(env.COUNTER_API_KEY),
        PUBLIC_COUNTER_API_KEY: Boolean(env.PUBLIC_COUNTER_API_KEY),
        COUNTER_WORKSPACE: Boolean(env.COUNTER_WORKSPACE),
        COUNTER_NAME: Boolean(env.COUNTER_NAME),
      },
    };
  }

  return { ok: true, key, workspace, name };
}

async function upstream(env, pathSuffix) {
  const cfg = getConfig(env);
  if (!cfg.ok) {
    return json(
      {
        error: 'Счётчик не настроен',
        hint: 'В Cloudflare Pages → Settings → Variables (Production) добавьте COUNTER_API_KEY и сделайте Redeploy.',
        missing: cfg.missing,
        has: cfg.has,
      },
      503,
    );
  }

  const url = `${COUNTER_API_BASE}/${encodeURIComponent(cfg.workspace)}/${encodeURIComponent(cfg.name)}${pathSuffix}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${cfg.key}` },
  });

  if (!res.ok) {
    return json({ error: 'Upstream error', status: res.status }, 502);
  }

  const data = await res.json();
  const count = parseCount(data);
  if (count === null) {
    return json({ error: 'Некорректный ответ счётчика' }, 502);
  }

  return json({ count });
}

export async function onRequestGet(context) {
  try {
    return await upstream(context.env, '');
  } catch {
    return json({ error: 'Ошибка сервера' }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    return await upstream(context.env, '/up');
  } catch {
    return json({ error: 'Ошибка сервера' }, 500);
  }
}
