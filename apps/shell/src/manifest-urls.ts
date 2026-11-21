import { type FederationManifest } from '@angular-architects/native-federation';

// Manifest entries may be relative (e.g. `remotes/dashboard/remoteEntry.json`), so
// one manifest works on any origin; resolve them against the page's base URL.
export function resolveManifestUrls(
  manifest: FederationManifest,
  base: string = document.baseURI,
): FederationManifest {
  const resolve = (url: string) => new URL(url, base).href;
  return Object.fromEntries(
    Object.entries(manifest).map(([name, entry]) => [
      name,
      typeof entry === 'string' ? resolve(entry) : { ...entry, url: resolve(entry.url) },
    ]),
  );
}
