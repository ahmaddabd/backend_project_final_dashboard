/**
 * Converts a string to a URL-friendly slug.
 *
 * @param str - The string to convert to a slug
 * @param options - Configuration options for slug generation
 * @returns The slugified string
 *
 * @example
 * ```typescript
 * slugify('Hello World!') // returns 'hello-world'
 * slugify('Hello World!', { lowercase: false }) // returns 'Hello-World'
 * slugify('Hello World!', { separator: '_' }) // returns 'hello_world'
 * slugify('Hello & World!', { removeSpecialCharacters: false }) // returns 'hello-&-world'
 * ```
 */
export function slugify(str: string, options: SlugifyOptions = {}): string {
  const {
    lowercase = true,
    separator = "-",
    removeSpecialCharacters = true,
    maxLength = 100,
    trim = true,
  } = options;

  // Convert to string if not already
  let slug = str.toString();

  // Convert special characters to their basic latin equivalents
  if (removeSpecialCharacters) {
    const charMap: { [key: string]: string } = {
      à: "a",
      á: "a",
      ã: "a",
      ä: "a",
      â: "a",
      å: "a",
      è: "e",
      é: "e",
      ë: "e",
      ê: "e",
      ì: "i",
      í: "i",
      ï: "i",
      î: "i",
      ò: "o",
      ó: "o",
      ö: "o",
      ô: "o",
      õ: "o",
      ù: "u",
      ú: "u",
      ü: "u",
      û: "u",
      ý: "y",
      ÿ: "y",
      ñ: "n",
      ç: "c",
      ß: "ss",
      æ: "ae",
      œ: "oe",
    };

    for (let char in charMap) {
      const regex = new RegExp(char, "g");
      slug = slug.replace(regex, charMap[char]);
    }
  }

  // Replace spaces and special characters
  if (removeSpecialCharacters) {
    slug = slug.replace(/[^a-zA-Z0-9\s-]/g, ""); // Remove special characters
  } else {
    slug = slug.replace(/[^\w\s-]/g, ""); // Keep some special characters
  }

  // Replace spaces with separator
  slug = slug.replace(/[\s]+/g, separator);

  // Remove multiple instances of separator
  slug = slug.replace(new RegExp(`${separator}+`, "g"), separator);

  if (trim) {
    // Remove separator from start and end
    slug = slug.replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
  }

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Truncate to maxLength while respecting word boundaries
  if (maxLength && slug.length > maxLength) {
    // Find the last occurrence of separator before maxLength
    const truncateIndex = slug.substring(0, maxLength).lastIndexOf(separator);
    slug = slug.substring(0, truncateIndex > 0 ? truncateIndex : maxLength);
  }

  return slug;
}

export interface SlugifyOptions {
  /**
   * Convert the slug to lowercase
   * @default true
   */
  lowercase?: boolean;

  /**
   * Character to use as separator
   * @default '-'
   */
  separator?: string;

  /**
   * Remove special characters
   * @default true
   */
  removeSpecialCharacters?: boolean;

  /**
   * Maximum length of the slug
   * @default 100
   */
  maxLength?: number;

  /**
   * Remove separator from start and end of slug
   * @default true
   */
  trim?: boolean;
}

/**
 * Generates a unique slug by appending a number if the slug already exists
 *
 * @param baseSlug - The initial slug to make unique
 * @param exists - Function that checks if a slug exists
 * @returns A unique slug
 *
 * @example
 * ```typescript
 * const exists = async (slug: string) => {
 *   return await repository.exists({ slug });
 * };
 * const uniqueSlug = await generateUniqueSlug('hello-world', exists);
 * ```
 */
export async function generateUniqueSlug(
  baseSlug: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await exists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Synchronous version of generateUniqueSlug
 */
export function generateUniqueSlugSync(
  baseSlug: string,
  exists: (slug: string) => boolean
): string {
  let slug = baseSlug;
  let counter = 1;

  while (exists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
