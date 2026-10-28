/**
 * Safe URL validation and normalization service.
 * Enforces strict http/https protocols and prevents protocol-based injection attacks (e.g., javascript:, data:).
 */

export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  error?: string;
}

export function validateHttpUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, normalizedUrl: '', error: 'URL is required' };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { isValid: false, normalizedUrl: '', error: 'URL is required' };
  }

  // Explicit check for malicious/dangerous prefixes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'Security alert: Only http:// or https:// URLs are allowed.',
    };
  }

  // Prepend https:// if user entered domain directly without protocol
  let urlToParse = trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    // If it looks like a domain, prepend https://
    if (/^[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}/.test(trimmed)) {
      urlToParse = `https://${trimmed}`;
    } else {
      return {
        isValid: false,
        normalizedUrl: '',
        error: 'Please enter a valid URL starting with http:// or https://',
      };
    }
  }

  try {
    const parsed = new URL(urlToParse);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        normalizedUrl: '',
        error: 'Only standard HTTP and HTTPS web links are permitted.',
      };
    }

    // Must have a valid hostname with at least one dot or localhost
    if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
      return {
        isValid: false,
        normalizedUrl: '',
        error: 'URL must contain a valid domain name.',
      };
    }

    return {
      isValid: true,
      normalizedUrl: parsed.href,
    };
  } catch {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'Invalid URL format.',
    };
  }
}

export function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
