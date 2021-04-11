import crypto from 'crypto';

const { CRYPTO_KEY } = process.env;

export const encrypt = (text: string) => {
  const IV_LEGNTH = 16;
  const iv = crypto.randomBytes(IV_LEGNTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(CRYPTO_KEY as string), iv);
  const encrypted = cipher.update(text);

  return iv.toString('hex') + ":" + Buffer.concat([encrypted, cipher.final()]).toString('hex');
};

export const decrypt = (text: string) => {
  const parts: any = text.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(CRYPTO_KEY as string), iv);
  const decrypted = decipher.update(encryptedText);

  return Buffer.concat([decrypted, decipher.final()]).toString();
};

/**
 * encrypt(string..). string encrypt function.
 * decrypt(string..). string decrypt function.
 */