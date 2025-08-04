// Client-side encryption service for sensitive financial data
import type { EncryptedField } from '@/types/security';

class EncryptionService {
  private readonly algorithm = 'AES-GCM';
  private readonly keyLength = 256;

  // Generate a key for encryption (in production, derive from user credentials)
  async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  // Derive key from password (for production use)
  async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt sensitive data
  async encrypt(data: string, key?: CryptoKey): Promise<EncryptedField> {
    const encryptionKey = key || await this.generateKey();
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      encryptionKey,
      encoder.encode(data)
    );

    return {
      encryptedValue: this.arrayBufferToBase64(encrypted),
      algorithm: this.algorithm,
      iv: this.arrayBufferToBase64(iv),
    };
  }

  // Decrypt sensitive data
  async decrypt(encryptedField: EncryptedField, key: CryptoKey): Promise<string> {
    const decoder = new TextDecoder();
    const iv = this.base64ToArrayBuffer(encryptedField.iv);
    const encryptedData = this.base64ToArrayBuffer(encryptedField.encryptedValue);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      encryptedData
    );

    return decoder.decode(decrypted);
  }

  // Encrypt financial data fields
  async encryptFinancialData(data: Record<string, any>, key?: CryptoKey): Promise<Record<string, any>> {
    const sensitiveFields = [
      'revenue', 'ebitda', 'cash', 'debt_tranche1', 'senior_secured',
      'interest_expense', 'net_income', 'free_cash_flow', 'operating_cash_flow'
    ];

    const encryptedData = { ...data };
    const encryptionKey = key || await this.generateKey();

    for (const field of sensitiveFields) {
      if (data[field] !== undefined && data[field] !== null) {
        encryptedData[field] = await this.encrypt(data[field].toString(), encryptionKey);
      }
    }

    return encryptedData;
  }

  // Decrypt financial data fields
  async decryptFinancialData(data: Record<string, any>, key: CryptoKey): Promise<Record<string, any>> {
    const decryptedData = { ...data };

    for (const [field, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && 'encryptedValue' in value) {
        try {
          const decryptedValue = await this.decrypt(value as EncryptedField, key);
          decryptedData[field] = parseFloat(decryptedValue) || decryptedValue;
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          decryptedData[field] = null;
        }
      }
    }

    return decryptedData;
  }

  // Data masking for non-privileged users
  maskSensitiveData(data: Record<string, any>, userCapabilities: string[]): Record<string, any> {
    const hasFullAccess = userCapabilities.includes('view_sensitive_financial_data');
    
    if (hasFullAccess) {
      return data;
    }

    const maskedData = { ...data };
    const sensitiveFields = [
      'revenue', 'ebitda', 'cash', 'debt_tranche1', 'senior_secured',
      'interest_expense', 'net_income', 'free_cash_flow', 'operating_cash_flow'
    ];

    for (const field of sensitiveFields) {
      if (maskedData[field] !== undefined && maskedData[field] !== null) {
        const value = maskedData[field].toString();
        // Mask all but first and last 2 digits
        if (value.length > 4) {
          maskedData[field] = `${value.substring(0, 2)}${'*'.repeat(value.length - 4)}${value.substring(value.length - 2)}`;
        } else {
          maskedData[field] = '*'.repeat(value.length);
        }
      }
    }

    return maskedData;
  }

  // Utility methods
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Generate salt for key derivation
  generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(16));
  }
}

export const encryptionService = new EncryptionService();
export { EncryptionService };