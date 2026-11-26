import test from 'node:test';
import assert from 'node:assert/strict';
import type {LabLogEntry} from '../data/labLog';
import {labLogs} from '../data/labLog';
import {
  formatLabLogTimestamp,
  formatRelativeTime,
  getLabLogCaption,
  getLatestLabLog,
  isSafeExternalUrl,
  sanitizeExternalUrl,
  sortLabLogsDesc,
} from './labLog';

const fixtureLogs: LabLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-20T09:15:00Z',
    caption: {
      en: 'First actuator bench sweep.',
      ar: 'أول مسح معملي للمشغل.',
      fr: 'Premier balayage sur banc.',
    },
    image: 'images/bench-1.png',
    sourceUrl: 'https://github.com/qrblab',
    tags: ['Actuators', 'Bench'],
  },
  {
    id: 'log-2',
    timestamp: '2026-11-23T18:30:00Z',
    caption: {
      en: 'DMA ADC trigger timing locked under 1.2 us jitter.',
    },
    sourceUrl: 'http://example.org/spec',
    tags: ['Firmware'],
  },
];

test('production labLogs array starts empty', () => {
  assert.equal(labLogs.length, 0);
});

test('sortLabLogsDesc and getLatestLabLog order entries newest-first', () => {
  assert.equal(getLatestLabLog([]), null);
  const sorted = sortLabLogsDesc(fixtureLogs);
  assert.equal(sorted[0]?.id, 'log-2');
  assert.equal(sorted[1]?.id, 'log-1');
  assert.equal(getLatestLabLog(fixtureLogs)?.id, 'log-2');
});

test('getLabLogCaption resolves English copy reliably', () => {
  assert.equal(
    getLabLogCaption(fixtureLogs[0]!),
    'First actuator bench sweep.',
  );
  assert.equal(
    getLabLogCaption(fixtureLogs[1]!),
    'DMA ADC trigger timing locked under 1.2 us jitter.',
  );
});

test('formatLabLogTimestamp formats UTC ISO timestamps cleanly and preserves invalid input', () => {
  const formatted = formatLabLogTimestamp('2026-11-23T18:30:00Z');
  assert.ok(formatted.includes('2026'));
  assert.ok(formatted.includes('18:30'));
  assert.equal(formatLabLogTimestamp('not-a-date'), 'not-a-date');
});

test('formatRelativeTime computes accurate buckets from Just now through years ago', () => {
  const now = Date.parse('2026-11-26T12:00:00Z');
  const SEC = 1000;
  const MIN = 60 * SEC;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  assert.equal(formatRelativeTime(new Date(now - 15 * SEC).toISOString(), now), 'Just now');
  assert.equal(formatRelativeTime(new Date(now - 5 * MIN).toISOString(), now), '5m ago');
  assert.equal(formatRelativeTime(new Date(now - 59 * MIN).toISOString(), now), '59m ago');
  assert.equal(formatRelativeTime(new Date(now - 3 * HOUR).toISOString(), now), '3h ago');
  assert.equal(formatRelativeTime(new Date(now - 23 * HOUR).toISOString(), now), '23h ago');
  assert.equal(formatRelativeTime(new Date(now - 1 * DAY).toISOString(), now), '1d ago');
  assert.equal(formatRelativeTime(new Date(now - 6 * DAY).toISOString(), now), '6d ago');
  assert.equal(formatRelativeTime(new Date(now - 7 * DAY).toISOString(), now), '1w ago');
  assert.equal(formatRelativeTime(new Date(now - 21 * DAY).toISOString(), now), '3w ago');
  assert.equal(formatRelativeTime(new Date(now - 28 * DAY).toISOString(), now), '1mo ago');
  assert.equal(formatRelativeTime(new Date(now - 65 * DAY).toISOString(), now), '2mo ago');
  assert.equal(formatRelativeTime(new Date(now - 340 * DAY).toISOString(), now), '11mo ago');
  assert.equal(formatRelativeTime(new Date(now - 365 * DAY).toISOString(), now), '1y ago');
  assert.equal(formatRelativeTime(new Date(now - 800 * DAY).toISOString(), now), '2y ago');
  // Supports YYYY-MM-DD date-only strings cleanly
  assert.equal(formatRelativeTime('2026-11-24', now), '2d ago');
  // Preserves invalid strings cleanly
  assert.equal(formatRelativeTime('not-a-date', now), 'not-a-date');
});

test('isSafeExternalUrl and sanitizeExternalUrl allow http/https and reject javascript/data/empty urls', () => {
  assert.equal(isSafeExternalUrl('https://github.com/qrblab'), true);
  assert.equal(isSafeExternalUrl('http://example.org/spec'), true);
  assert.equal(isSafeExternalUrl('javascript:alert(1)'), false);
  assert.equal(isSafeExternalUrl('data:text/html,hi'), false);
  assert.equal(isSafeExternalUrl(''), false);
  assert.equal(isSafeExternalUrl(undefined), false);

  assert.equal(sanitizeExternalUrl('  https://github.com/qrblab  '), 'https://github.com/qrblab');
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeExternalUrl('data:text/html,<script>1</script>'), '');
  assert.equal(sanitizeExternalUrl('//evil.com/path'), '');
});
