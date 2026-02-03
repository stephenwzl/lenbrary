import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';

/**
 * Calculate SHA-256 hash for a file
 * @param filePath - Path to the file
 * @returns SHA-256 hash as hex string
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (data: Buffer | string) => {
      hash.update(data);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Calculate SHA-256 hash for a buffer synchronously
 * @param buffer - File buffer
 * @returns SHA-256 hash as hex string
 */
export function calculateBufferHash(buffer: Buffer): string {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

/**
 * Calculate SHA-256 hash for a buffer asynchronously
 * @param buffer - File buffer
 * @returns SHA-256 hash as hex string
 */
export async function calculateBufferHashAsync(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    const hash = createHash('sha256');
    hash.update(buffer);
    resolve(hash.digest('hex'));
  });
}
