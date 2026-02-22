"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKey = exports.EncryptionService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configuration
const MASTER_KEY_HEX = process.env.MASTER_KEY || '';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
/**
 * Key Vault - Stores historical keys for decryption.
 * Format: { "v001": "HEX_KEY", "v002": "HEX_KEY" }
 */
const KEY_VAULT = {
    'v001': process.env.MASTER_KEY || '0'.repeat(64),
    // Future keys would be added here or loaded from a secure KMS
};
const currentKeyVersion = 'v001';
const currentKey = KEY_VAULT[currentKeyVersion];
/**
 * Vault Pro Encryption Service
 * Implements AES-256-GCM with Key Rotation support.
 * Structure: [KeyVersion (4 bytes)][IV (12 bytes)][AuthTag (16 bytes)][Ciphertext (Variable)]
 * All returned as a Hex string.
 */
class EncryptionService {
    /**
     * Encrypts a string using AES-256-GCM
     * @param text The plaintext to encrypt
     * @returns Hex string containing version+iv+tag+ciphertext
     */
    static encrypt(text) {
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        const key = Buffer.from(MASTER_KEY_HEX, 'hex');
        const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        // Construct the payload: Version + IV + Tag + EncryptedData
        // We use Hex for storage as requested ("32 bytes Encrypted Format IV Encrypted Dead Tag Hexagons")
        const versionHex = Buffer.from(currentKeyVersion).toString('hex'); // 8 chars
        const ivHex = iv.toString('hex'); // 24 chars
        const tagHex = authTag.toString('hex'); // 32 chars
        return `${versionHex}:${ivHex}:${tagHex}:${encrypted}`;
    }
    /**
     * Decrypts a string using AES-256-GCM
     * @param encryptedText The hex string to decrypt (format: version:iv:tag:ciphertext)
     * @returns The decrypted plaintext
     */
    static decrypt(encryptedText) {
        const parts = encryptedText.split(':');
        if (parts.length !== 4) {
            throw new Error('Invalid encrypted format. Expected version:iv:tag:ciphertext');
        }
        const [versionHex, ivHex, tagHex, encrypted] = parts;
        const version = Buffer.from(versionHex, 'hex').toString('utf8');
        const keyHex = KEY_VAULT[version];
        if (!keyHex) {
            throw new Error(`Decryption failed: Key version ${version} not found in Vault.`);
        }
        const key = Buffer.from(keyHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(tagHex, 'hex');
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        // Check for re-encryption need (Rotation)
        if (version !== currentKeyVersion) {
            console.log(`[Vault] Key rotation needed for data. Version ${version} -> ${currentKeyVersion}`);
            // In a real app, you would re-encrypt and update the record here
        }
        return decrypted;
    }
    /**
     * Re-encrypts data to the current version
     */
    static reEncrypt(encryptedText) {
        const decrypted = this.decrypt(encryptedText);
        return this.encrypt(decrypted);
    }
}
exports.EncryptionService = EncryptionService;
// Generate a random key for dev purposes if needed
const generateKey = () => crypto_1.default.randomBytes(32).toString('hex');
exports.generateKey = generateKey;
