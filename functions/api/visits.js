const COOKIE = 'zerkala-visitor';
const number = (value) => Math.max(0, Number(value) || 0);

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export async function onRequest({ request, env }) {
  try {
    if (!['GET', 'POST'].includes(request.method)) {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });
    }
    const kv = env?.VISITS;
    if (!kv) return json({ error: 'Counter not configured', missing: ['VISITS'] }, 503);
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yekaterinburg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const dailyKey = `daily:${date}`;
    const [rawCount, rawReturning, rawDaily] = await Promise.all([
      kv.get('count'), kv.get('returning'), kv.get(dailyKey),
    ]);
    let count = number(rawCount);
    let returning = number(rawReturning);
    const daily = rawDaily ? JSON.parse(rawDaily) : { visitors: 0, returning: 0 };
    const headers = {};
    if (request.method === 'POST') {
      const cookie = request.headers.get('Cookie') || '';
      const candidate = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
      const visitor = /^[0-9a-f-]{36}$/i.test(candidate || '') ? candidate : crypto.randomUUID();
      const visitorKey = `visitor:${visitor}`;
      const todayKey = `seen:${date}:${visitor}`;
      const [known, seenToday] = await Promise.all([kv.get(visitorKey), kv.get(todayKey)]);
      // Crossing midnight in an existing session only updates the daily audience.
      const rollover = request.headers.get('X-Visit-Rollover') === '1';
      if (!rollover) {
        count += 1;
        if (known) returning += 1;
      }
      if (!seenToday) daily.visitors += 1;
      if (known && !rollover) daily.returning += 1;
      await Promise.all([
        kv.put('count', String(count)),
        kv.put('returning', String(returning)),
        kv.put(dailyKey, JSON.stringify(daily)),
        kv.put(visitorKey, '1', { expirationTtl: 34560000 }),
        kv.put(todayKey, '1', { expirationTtl: 172800 }),
      ]);
      headers['Set-Cookie'] = `${COOKIE}=${visitor}; Max-Age=34560000; Path=/; HttpOnly; Secure; SameSite=Lax`;
    }
    return json({ count, today: number(daily.visitors), returning, returningToday: number(daily.returning), date, timeZone: 'Asia/Yekaterinburg' }, 200, headers);
  } catch {
    return json({ error: 'Function error' }, 500);
  }
}
