/**
 * Handle filename encoding issues in HTTP multipart/form-data requests
 */

/**
 * Try to fix filename encoding issues
 * @param filename filename that may have encoding problems
 * @returns fixed filename
 */
export function fixFilenameEncoding(filename: string): string {
  if (!filename) {
    return filename;
  }

  // Check if it contains non-ASCII characters that might be garbled
  const hasGarbledChars = /[^\x00-\x7F]/.test(filename);
  if (!hasGarbledChars) {
    // If no non-ASCII characters, return directly
    return filename;
  }

  // Try encoding detection and fix
  try {
    // Method 1: Convert Latin-1 interpreted bytes back to UTF-8
    // This is the most common case
    const bytes: number[] = [];
    for (let i = 0; i < filename.length; i++) {
      bytes.push(filename.charCodeAt(i) & 0xFF);
    }
    
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const decoded = decoder.decode(new Uint8Array(bytes));
    
    // Verify that the decoded result contains valid Chinese characters
    if (/[\u4e00-\u9fa5]/.test(decoded)) {
      console.log(`[Encoding] Fixed filename: "${filename}" -> "${decoded}"`);
      return decoded;
    }
  } catch {
    // Decode failed, try other methods
  }

  try {
    // Method 2: Use escape + decodeURIComponent
    const escaped = escape(filename);
    const decoded = decodeURIComponent(escaped);
    
    if (decoded !== filename && /[\u4e00-\u9fa5]/.test(decoded)) {
      console.log(`[Encoding] Fixed filename via escape: "${filename}" -> "${decoded}"`);
      return decoded;
    }
  } catch {
    // Decode failed
  }

  // If all methods fail, return original filename
  return filename;
}
