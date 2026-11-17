import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/visits.js';

test('daily audience, repeat sessions, rollover and existing total', async () => {
  const values = new Map([['count', '410']]);
  const env = { VISITS: { get: async (key) => values.get(key) ?? null, put: async (key, value) => values.set(key, value) } };
  const call = (method = 'GET', headers = {}) => onRequest({ env, request: new Request('https://example.com/api/visits', { method, headers }) });
  let response = await call();
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal((await response.json()).count, 410);
  response = await call('POST');
  const cookie = response.headers.get('Set-Cookie').split(';')[0];
  let data = await response.json();
  assert.deepEqual([data.count, data.today, data.returning, data.returningToday], [411, 1, 0, 0]);
  response = await call('POST', { Cookie: cookie });
  data = await response.json();
  assert.deepEqual([data.count, data.today, data.returning, data.returningToday], [412, 1, 1, 1]);
  response = await call('POST');
  data = await response.json();
  assert.deepEqual([data.count, data.today, data.returning], [413, 2, 1]);
  // Simulate an existing session appearing on a new day.
  values.delete(`daily:${data.date}`);
  for (const key of values.keys()) if (key.startsWith('seen:')) values.delete(key);
  response = await call('POST', { Cookie: cookie, 'X-Visit-Rollover': '1' });
  data = await response.json();
  assert.deepEqual([data.count, data.today, data.returning, data.returningToday], [413, 1, 1, 0]);
  await call();
  assert.equal(values.get('count'), '413');
});

test('missing binding and unsupported method', async () => {
  const request = (method) => new Request('https://example.com/api/visits', { method });
  assert.equal((await onRequest({ env: {}, request: request('GET') })).status, 503);
  assert.equal((await onRequest({ env: {}, request: request('DELETE') })).status, 405);
});
