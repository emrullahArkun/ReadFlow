import { describe, it, expect } from 'vitest';
import { getHighResImage, getOpenLibraryCoverUrl } from './googleBooks';

describe('googleBooks utils', () => {
    describe('getHighResImage', () => {
        it('returns empty string if no url', () => {
            expect(getHighResImage(null)).toBe('');
            expect(getHighResImage(undefined)).toBe('');
            expect(getHighResImage('')).toBe('');
        });

        it('replaces http with https', () => {
            const result = getHighResImage('http://example.com/image.jpg');
            expect(result).toBe('https://example.com/image.jpg');
        });

        it('replaces &zoom=1 with &zoom=0', () => {
            const result = getHighResImage('https://example.com/image.jpg?id=123&zoom=1');
            expect(result).toBe('https://example.com/image.jpg?id=123&zoom=0');
        });

        it('removes &edge=curl', () => {
            const result = getHighResImage('https://example.com/image.jpg?id=123&edge=curl&zoom=1');
            expect(result).toBe('https://example.com/image.jpg?id=123&zoom=0');
        });

        it('applies all transformations correctly combined', () => {
            const input = 'http://books.google.com/books/content?id=xyz&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api';
            const expected = 'https://books.google.com/books/content?id=xyz&printsec=frontcover&img=1&zoom=0&source=gbs_api';
            expect(getHighResImage(input)).toBe(expected);
        });
    });

    describe('getOpenLibraryCoverUrl', () => {
        it('returns OpenLibrary URL for valid ISBN', () => {
            expect(getOpenLibraryCoverUrl('9781234567890')).toBe('https://covers.openlibrary.org/b/isbn/9781234567890-L.jpg');
        });

        it('strips hyphens from ISBN', () => {
            expect(getOpenLibraryCoverUrl('978-1-234-56789-0')).toBe('https://covers.openlibrary.org/b/isbn/9781234567890-L.jpg');
        });

        it('returns empty string for ID: prefixed values', () => {
            expect(getOpenLibraryCoverUrl('ID:abc123')).toBe('');
        });

        it('returns empty string for short ISBNs', () => {
            expect(getOpenLibraryCoverUrl('123')).toBe('');
        });

        it('returns empty string for falsy values', () => {
            expect(getOpenLibraryCoverUrl(null)).toBe('');
            expect(getOpenLibraryCoverUrl(undefined)).toBe('');
            expect(getOpenLibraryCoverUrl('')).toBe('');
        });
    });
});
