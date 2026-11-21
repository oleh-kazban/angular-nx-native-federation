import { resolveManifestUrls } from './manifest-urls';

describe('resolveManifestUrls', () => {
  const base = 'https://example.org/portal/';

  it('resolves relative entries against the base URL, in both entry shapes', () => {
    expect(
      resolveManifestUrls(
        {
          dashboard: 'remotes/dashboard/remoteEntry.json',
          reports: { url: './remotes/reports/remoteEntry.json', integrity: 'sha384-abc' },
        },
        base,
      ),
    ).toEqual({
      dashboard: 'https://example.org/portal/remotes/dashboard/remoteEntry.json',
      reports: {
        url: 'https://example.org/portal/remotes/reports/remoteEntry.json',
        integrity: 'sha384-abc',
      },
    });
  });

  it('keeps absolute entries unchanged', () => {
    expect(
      resolveManifestUrls({ dashboard: 'http://localhost:4201/remoteEntry.json' }, base),
    ).toEqual({ dashboard: 'http://localhost:4201/remoteEntry.json' });
  });

  it('resolves against the page base URL by default', () => {
    expect(resolveManifestUrls({ dashboard: 'remoteEntry.json' })).toEqual({
      dashboard: new URL('remoteEntry.json', document.baseURI).href,
    });
  });
});
