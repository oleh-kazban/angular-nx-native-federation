import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { RemoteUnavailablePage } from './remote-unavailable';

describe('RemoteUnavailablePage', () => {
  const render = async (query: string) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'remote-unavailable', component: RemoteUnavailablePage }]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/remote-unavailable${query}`, RemoteUnavailablePage);
    return harness.routeNativeElement as HTMLElement;
  };

  it('offers Try again for an in-app path', async () => {
    const page = await render('?from=%2Fdashboard%3Ftab%3D1');
    expect(page.querySelector('button')?.textContent).toContain('Try again');
  });

  // `from` comes from the URL, so anyone can craft it: only same-app absolute paths are retried.
  it.each([
    ['no from', ''],
    ['an empty from', '?from='],
    ['a protocol-relative URL', '?from=%2F%2Fevil.example'],
    ['an absolute URL', '?from=https%3A%2F%2Fevil.example%2F'],
    ['a javascript: URL', '?from=javascript%3Aalert(1)'],
    ['a relative path', '?from=dashboard'],
  ])('offers no Try again for %s', async (_case, query) => {
    const page = await render(query);
    expect(page.querySelector('button')).toBeNull();
    expect(page.querySelector('a')?.textContent).toContain('Back to home');
  });
});
