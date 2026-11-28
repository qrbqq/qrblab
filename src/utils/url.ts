const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/;
const SCHEME_RE = /^([a-zA-Z][a-zA-Z\d+\-.]*):/;
const EMAIL_RE = /^[^\s<>@"']+@[^\s<>@"']+\.[^\s<>@"']+$/;

/**
 * Checks whether an external URL strictly uses `http:` or `https:` with no control characters.
 */
export function isSafeExternalUrl(rawUrl: string | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return false;
  }
  const trimmed = rawUrl.trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Validates and returns a sanitized external `http:`/`https:` URL (or `mailto:` when permitted),
 * returning `""` for unsafe schemes (`javascript:`, `data:`, `vbscript:`, `file:`) or malformed URLs.
 */
export function sanitizeExternalUrl(
  rawUrl: string | undefined,
  options: {allowMailto?: boolean} = {},
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '';
  }
  const trimmed = rawUrl.trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) {
    return '';
  }
  if (trimmed.startsWith('//')) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed;
    }
    if (options.allowMailto && parsed.protocol === 'mailto:') {
      const targetEmail = trimmed.slice('mailto:'.length).trim();
      return EMAIL_RE.test(targetEmail) ? `mailto:${targetEmail}` : '';
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Validates an email string before wrapping in `mailto:`.
 */
export function isValidEmailAddress(rawEmail: string | undefined): boolean {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return false;
  }
  const trimmed = rawEmail.trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) {
    return false;
  }
  return EMAIL_RE.test(trimmed);
}

/**
 * Sanitizes asset and document paths (PDFs, thumbnails, avatars, preview screenshots).
 * Strictly permits:
 *   - Safe external `http:` or `https:` URLs
 *   - Safe relative local paths (e.g. "papers/doc.pdf", "./favicon.svg", "/images/founder-portrait.png")
 * Explicitly blocks:
 *   - `javascript:`, `data:`, `vbscript:`, `blob:`, `file:` schemes
 *   - Protocol-relative `//host` URLs and path traversal (`..` segments)
 *   - Control characters / whitespace protocol smuggling
 */
export function sanitizeSafeUrl(
  rawUrl: string | undefined,
  baseUrl = './',
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '';
  }
  const trimmed = rawUrl.trim();
  if (!trimmed || CONTROL_CHARS_RE.test(trimmed)) {
    return '';
  }

  // Block protocol-relative open redirects (`//evil.com`)
  if (trimmed.startsWith('//')) {
    return '';
  }

  // Normalize scheme checks even if obfuscated with whitespace/colons
  const compactPrefix = trimmed.replace(/\s+/g, '');
  const schemeMatch = compactPrefix.match(SCHEME_RE);
  if (schemeMatch) {
    const scheme = schemeMatch[1]?.toLowerCase();
    if (scheme !== 'http' && scheme !== 'https') {
      return '';
    }
    return isSafeExternalUrl(trimmed) ? trimmed : '';
  }

  // Safe local relative path (block traversal segments like ../)
  const cleanPath = trimmed.replace(/^(\.\/)+/, '').replace(/^\/+/, '');
  if (!cleanPath || cleanPath.startsWith('//')) {
    return '';
  }
  const segments = cleanPath.split(/[\\/]/);
  if (segments.some((seg) => seg === '..')) {
    return '';
  }

  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${cleanBase}${cleanPath}`;
}
