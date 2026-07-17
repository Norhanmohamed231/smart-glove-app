/** Android System Intelligence — only package that reports installed offline models. */
export const ANDROID_ON_DEVICE_SERVICE = 'com.google.android.as';

export const PREFERRED_ARABIC_LOCALES = ['ar-EG', 'ar-SA'] as const;

export const FALLBACK_GOOGLE_PACKAGES = [
  'com.google.android.googlequicksearchbox',
  ANDROID_ON_DEVICE_SERVICE,
] as const;

export function normalizeLocaleTag(locale: string): string {
  return locale.trim().replace(/_/g, '-').toLowerCase();
}

export function isArabicLocale(locale: string): boolean {
  const norm = normalizeLocaleTag(locale);
  return norm === 'ar' || norm.startsWith('ar-');
}

export function pickPreferredArabic(pool: string[]): string | null {
  if (pool.length === 0) return null;

  for (const preferred of PREFERRED_ARABIC_LOCALES) {
    const pref = preferred.toLowerCase();
    const match = pool.find((locale) => {
      const norm = normalizeLocaleTag(locale);
      return norm === pref || norm.startsWith(`${pref}-`);
    });
    if (match) return match;
  }

  return pool.find((locale) => isArabicLocale(locale)) ?? null;
}

/** Prefer `.as` first — offline packs are only visible through that service. */
export function buildAndroidLocaleCheckOrder(discoveredPackages: string[]): string[] {
  const ordered = new Set<string>();
  ordered.add(ANDROID_ON_DEVICE_SERVICE);
  for (const pkg of discoveredPackages) {
    if (pkg) ordered.add(pkg);
  }
  for (const pkg of FALLBACK_GOOGLE_PACKAGES) {
    ordered.add(pkg);
  }
  return [...ordered];
}

/** Online recognition should prefer Google app, not Android System Intelligence. */
export function buildAndroidOnlineCheckOrder(discoveredPackages: string[]): string[] {
  const ordered = new Set<string>();
  ordered.add('com.google.android.googlequicksearchbox');
  for (const pkg of discoveredPackages) {
    if (pkg && pkg !== ANDROID_ON_DEVICE_SERVICE) {
      ordered.add(pkg);
    }
  }
  for (const pkg of FALLBACK_GOOGLE_PACKAGES) {
    if (pkg !== ANDROID_ON_DEVICE_SERVICE) {
      ordered.add(pkg);
    }
  }
  return [...ordered];
}

export function getPreferredOnlinePackage(candidates: string[]): string {
  const list = candidates.filter(Boolean);
  if (list.includes('com.google.android.googlequicksearchbox')) {
    return 'com.google.android.googlequicksearchbox';
  }
  const nonAs = list.find((pkg) => pkg !== ANDROID_ON_DEVICE_SERVICE);
  return nonAs ?? 'com.google.android.googlequicksearchbox';
}
