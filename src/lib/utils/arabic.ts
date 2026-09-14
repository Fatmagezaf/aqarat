/**
 * Arabic Text Normalization & Search Token Utilities
 * Handles letter variations without mutating original stored values
 */

export function normalizeArabic(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    // Remove diacritics / tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Normalize Alif variations (أ, إ, آ, ٱ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Ta Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Normalize Alif Maqsura (ى -> ي)
    .replace(/ى/g, 'ي')
    // Remove duplicate whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates searchable tokens (prefixes & words) from multiple fields
 * Used for Firestore `array-contains` queries
 */
export function generateSearchTokens(fields: (string | number | undefined | null)[]): string[] {
  const tokenSet = new Set<string>();

  for (const field of fields) {
    if (!field) continue;
    const str = String(field).trim();
    if (!str) continue;

    // Add raw lowercase
    const rawLower = str.toLowerCase();
    tokenSet.add(rawLower);

    // Add normalized Arabic version
    const normalized = normalizeArabic(str);
    if (normalized) {
      tokenSet.add(normalized);

      // Split into words
      const words = normalized.split(/[\s\-_\/,\.]+/).filter((w) => w.length >= 2);
      for (const word of words) {
        tokenSet.add(word);
        // Add progressive prefixes for partial word match (e.g. "مدين", "مدينت", "مدينتي")
        for (let i = 2; i <= Math.min(word.length, 12); i++) {
          tokenSet.add(word.substring(0, i));
        }
      }
    }

    // Split raw words for alphanumeric codes (e.g. "FAT", "1135", "B12")
    const rawWords = rawLower.split(/[\s\-_\/,\.]+/).filter((w) => w.length >= 2);
    for (const w of rawWords) {
      tokenSet.add(w);
      for (let i = 2; i <= Math.min(w.length, 10); i++) {
        tokenSet.add(w.substring(0, i));
      }
    }
  }

  return Array.from(tokenSet).slice(0, 100); // Keep within Firestore index limits
}
