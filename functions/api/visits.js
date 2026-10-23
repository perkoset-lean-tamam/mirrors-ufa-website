const COUNTER_API_BASE = 'https://api.counterapi.dev/v2';

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

function getConfig(env) {
  // Prefer non-PUBLIC names; fall back to PUBLIC_* if still set in CF Pages
  const key = env.COUNTER_API_KEY || env.PUBLIC_COUNTER_API_KEY;
  const workspace = env.COUNTER_WORKSPACE || env.PUBLIC_COUNTER_WORKSPACE;
  const name = env.COUNTER_NAME || env.PUBLIC_COUNTER_NAME;
  if (!key || !workspace || !name) return null;
  return { key, workspace, name };
}

async function upstream(env, pathSuffix) {
  const cfg = getConfig(env);
  if (!cfg) {
    return json({ error: 'Счётчик не настроен' }, 503);
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
