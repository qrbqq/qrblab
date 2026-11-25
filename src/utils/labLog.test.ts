import test from 'node:test';
import assert from 'node:assert/strict';
import type {LabLogEntry} from '../data/labLog';
import {labLogs} from '../data/labLog';
import {
  formatLabLogTimestamp,
  getLabLogCaption,
  getLatestLabLog,
  isSafeExternalUrl,
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

test('isSafeExternalUrl allows http/https and rejects javascript/data/empty urls', () => {
  assert.equal(isSafeExternalUrl('https://github.com/qrblab'), true);
  assert.equal(isSafeExternalUrl('http://example.org/spec'), true);
  assert.equal(isSafeExternalUrl('javascript:alert(1)'), false);
  assert.equal(isSafeExternalUrl('data:text/html,hi'), false);
  assert.equal(isSafeExternalUrl(''), false);
  assert.equal(isSafeExternalUrl(undefined), false);
});
