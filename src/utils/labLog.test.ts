import test from 'node:test';
import assert from 'node:assert/strict';
import type {LabLogEntry} from '../data/labLog';
import {labLogs} from '../data/labLog';
import {siteConfig} from '../data/siteConfig';
import {
  computeThreadConnections,
  formatLabLogTimestamp,
  formatRelativeTime,
  getLabLogCaption,
  getLatestLabLog,
  getLatestLabLogs,
  HOME_LAB_LOG_PREVIEW_LIMIT,
  isSafeExternalUrl,
  resolveLabLogImages,
  resolveLabLogVideo,
  resolveProfileIdentity,
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

test('getLatestLabLogs caps preview at max 3 newest posts by default', () => {
  assert.equal(HOME_LAB_LOG_PREVIEW_LIMIT, 3);
  assert.deepEqual(getLatestLabLogs([]), []);
  assert.equal(getLatestLabLogs(fixtureLogs).length, 2);

  const sixLogs: LabLogEntry[] = Array.from({length: 6}, (_, idx) => ({
    id: `log-${idx + 1}`,
    timestamp: `2026-11-0${idx + 1}T10:00:00Z`,
    caption: {en: `Entry ${idx + 1}`},
  }));

  const capped = getLatestLabLogs(sixLogs);
  assert.equal(capped.length, 3);
  assert.deepEqual(
    capped.map((item) => item.id),
    ['log-6', 'log-5', 'log-4'],
  );
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

test('resolveLabLogImages supports multi-image arrays with GIFs, deduplication, and legacy image field', () => {
  const multiEntry: LabLogEntry = {
    id: 'm1',
    timestamp: '2026-11-25T10:00:00Z',
    caption: {en: 'Multi media'},
    images: ['images/a.png', 'images/loop.gif', ' ', 'images/a.png'],
    image: 'images/b.jpg',
  };
  assert.deepEqual(resolveLabLogImages(multiEntry), [
    'images/a.png',
    'images/loop.gif',
    'images/b.jpg',
  ]);
  assert.deepEqual(resolveLabLogImages(fixtureLogs[1]!), []);
});

test('resolveLabLogVideo trims and returns MP4 attachment path cleanly', () => {
  const videoEntry: LabLogEntry = {
    id: 'v1',
    timestamp: '2026-11-25T10:00:00Z',
    caption: {en: 'Video test'},
    video: '  images/founder-hero.mp4  ',
  };
  assert.equal(resolveLabLogVideo(videoEntry), 'images/founder-hero.mp4');
  assert.equal(resolveLabLogVideo(fixtureLogs[0]!), '');
});

test('computeThreadConnections links consecutive dispatches sharing identical threadId', () => {
  const entries: LabLogEntry[] = [
    {id: 'a1', timestamp: '2026-11-25T12:00:00Z', threadId: 't-alpha', caption: {en: 'Thread 1'}},
    {id: 'a2', timestamp: '2026-11-25T11:55:00Z', threadId: 't-alpha', caption: {en: 'Thread 2'}},
    {id: 'a3', timestamp: '2026-11-25T11:50:00Z', threadId: 't-alpha', caption: {en: 'Thread 3'}},
    {id: 'solo', timestamp: '2026-11-25T10:00:00Z', caption: {en: 'Standalone'}},
    {id: 'b1', timestamp: '2026-11-25T09:00:00Z', threadId: 't-beta', caption: {en: 'Thread B1'}},
  ];

  const connected = computeThreadConnections(entries);
  assert.equal(connected[0]?.connectsFromPrev, false);
  assert.equal(connected[0]?.connectsToNext, true);

  assert.equal(connected[1]?.connectsFromPrev, true);
  assert.equal(connected[1]?.connectsToNext, true);

  assert.equal(connected[2]?.connectsFromPrev, true);
  assert.equal(connected[2]?.connectsToNext, false);

  assert.equal(connected[3]?.connectsFromPrev, false);
  assert.equal(connected[3]?.connectsToNext, false);

  assert.equal(connected[4]?.connectsFromPrev, false);
  assert.equal(connected[4]?.connectsToNext, false);
});

test('resolveProfileIdentity preserves exact casing and routes to /log', () => {
  const customConfig = {
    ...siteConfig,
    displayName: 'QrB_LaB_Alpha',
    handle: '@QrB_01',
    profileCoverVideo: 'images/founder-hero.mp4',
  };

  const primary = resolveProfileIdentity(customConfig);
  assert.equal(primary.displayName, 'QrB_LaB_Alpha');
  assert.equal(primary.handle, '@QrB_01');
  assert.equal(primary.profileCoverVideo, 'images/founder-hero.mp4');
  assert.equal(primary.routePath, '/log');
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
  assert.equal(formatRelativeTime('2026-11-24', now), '2d ago');
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

