import { describe, it, expect } from 'vitest';
import { validateHttpUrl, getDomainFromUrl } from '../src/services/urlValidator';

describe('urlValidator service', () => {
  it('validates and normalizes valid https URL', () => {
    const result = validateHttpUrl('https://github.com/developer/devflow');
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe('https://github.com/developer/devflow');
  });

  it('validates and normalizes valid http URL', () => {
    const result = validateHttpUrl('http://localhost:3000');
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe('http://localhost:3000/');
  });

  it('prepends https:// if domain format is supplied without protocol', () => {
    const result = validateHttpUrl('react.dev/learn');
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe('https://react.dev/learn');
  });

  it('blocks dangerous javascript: URI injection', () => {
    const result = validateHttpUrl('javascript:alert(1)');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Security alert');
  });

  it('blocks dangerous data: URI injection', () => {
    const result = validateHttpUrl('data:text/html,<script>alert(1)</script>');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Security alert');
  });

  it('blocks file: schemes', () => {
    const result = validateHttpUrl('file:///etc/passwd');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Security alert');
  });

  it('rejects empty or whitespace-only strings', () => {
    const result = validateHttpUrl('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('URL is required');
  });

  it('extracts clean domain name properly without www prefix', () => {
    expect(getDomainFromUrl('https://www.github.com/facebook/react')).toBe('github.com');
    expect(getDomainFromUrl('https://developer.mozilla.org/en-US/docs')).toBe('developer.mozilla.org');
  });
});
