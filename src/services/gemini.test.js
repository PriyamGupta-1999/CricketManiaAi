import { describe, it, expect, vi } from 'vitest';
import { encryptData, decryptData } from './gemini';

describe('Encryption Utility', () => {
    it('should correctly encrypt and decrypt a string', () => {
        const secret = 'test-api-key-123';
        const encrypted = encryptData(secret);
        const decrypted = decryptData(encrypted);

        expect(encrypted).not.toBe(secret);
        expect(decrypted).toBe(secret);
    });

    it('should return empty string for null input', () => {
        expect(encryptData(null)).toBe('');
        expect(decryptData(null)).toBe('');
    });
});
