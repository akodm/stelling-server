import bcrypt from 'bcrypt';
import crypto from 'crypto';

const { CRYPTO_KEY, SALT_ROUNDS } = process.env;

// 단방향 해싱.
export const hash = (pass: string) => new Promise((resolve, reject) => {
  bcrypt.genSalt(parseInt(SALT_ROUNDS as string), (err, salt) => {
    if(err) {
      reject(err);
    } else {
      bcrypt.hash(pass, salt, (err, hash) => {
        if(err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    }
  });
});

// 비교.
export const compare = (pass: string, hash: string) => new Promise((resolve, reject) => {
  bcrypt.compare(pass, hash, (err, result) => {
    if(err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

// 암호화.
export const encrypt = (text: string) => {
  const IV_LEGNTH = 16;
  const iv = crypto.randomBytes(IV_LEGNTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(CRYPTO_KEY as string), iv);
  const encrypted = cipher.update(text);

  return iv.toString('hex') + ":" + Buffer.concat([encrypted, cipher.final()]).toString('hex');
};

// 복호화.
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