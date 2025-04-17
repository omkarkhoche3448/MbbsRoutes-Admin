export class CryptoService {
  static async importKey() {
    try {
      const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
      if (!ENCRYPTION_KEY) {
        throw new Error('Encryption key is not configured');
      }

      // Create SHA-256 hash of the key to ensure 32 bytes
      const encoder = new TextEncoder();
      const keyBuffer = encoder.encode(ENCRYPTION_KEY);
      const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);

      // Import the key for AES-CBC
      return await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-CBC' },
        false,
        ['decrypt']
      );
    } catch (error) {
      console.error('Key import error:', error);
      throw new Error(`Failed to import encryption key: ${error.message}`);
    }
  }

  static async decrypt(encryptedData) {
    try {
      if (!encryptedData) {
        throw new Error('No encrypted data provided');
      }

      // Split IV and encrypted data
      const [ivHex, encryptedHex] = encryptedData.split(':');
      if (!ivHex || !encryptedHex) {
        throw new Error('Invalid encrypted data format');
      }

      // Convert hex to Uint8Array
      const iv = new Uint8Array(
        ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
      const encrypted = new Uint8Array(
        encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );

      const key = await this.importKey();
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-CBC',
          iv: iv
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      const decodedText = decoder.decode(decrypted);
      
      try {
        return JSON.parse(decodedText);
      } catch (jsonError) {
        console.error('JSON Parse Error:', decodedText);
        throw new Error('Failed to parse decrypted data as JSON');
      }
    } catch (error) {
      console.error('Decryption details:', {
        error,
        dataFormat: encryptedData?.includes(':') ? 'valid' : 'invalid',
        hasKey: !!import.meta.env.VITE_ENCRYPTION_KEY
      });
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}