import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes, withNavigationErrorHandler } from '@angular/router';
import { App } from './app';
import { appRoutes } from './app.routes';
import { HomePage } from './home-page';
import { redirectToRemoteUnavailable } from './remote-navigation-error';

@Component({ selector: 'app-dashboard-stub', template: '<h1>Dashboard feature</h1>' })
class DashboardStub {}

@Component({ selector: 'app-reports-stub', template: '<h1>Reports feature</h1>' })
class ReportsStub {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: HomePage, pathMatch: 'full' },
          { path: 'dashboard', component: DashboardStub },
          { path: 'reports', component: ReportsStub },
        ]),
      ],
    }).compileComponents();
  });

  it('navigates between features and marks the active link', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/dashboard');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const dashboard = compiled.querySelector<HTMLAnchorElement>('a[href="/dashboard"]');
    const reports = compiled.querySelector<HTMLAnchorElement>('a[href="/reports"]');
    const home = compiled.querySelector<HTMLAnchorElement>('nav a[href="/"]');
    expect(compiled.querySelector('h1')?.textContent).toContain('Dashboard feature');
    expect(dashboard?.getAttribute('aria-current')).toBe('page');
    expect(reports?.getAttribute('aria-current')).toBeNull();

    reports?.click();
    await fixture.whenStable();
    expect(compiled.querySelector('h1')?.textContent).toContain('Reports feature');
    expect(reports?.getAttribute('aria-current')).toBe('page');
    expect(dashboard?.getAttribute('aria-current')).toBeNull();

    home?.click();
    await fixture.whenStable();
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to Client Portal');
    expect(home?.getAttribute('aria-current')).toBe('page');
    expect(reports?.getAttribute('aria-current')).toBeNull();
  });
});

describe('shell home route', () => {
  it('renders the home page, also for unknown URLs, without loading a remote', async () => {
    let remoteLoads = 0;
    const loadRemoteModule = async () => {
      remoteLoads++;
      throw new Error('Remote should not be loaded on the home page');
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(
          appRoutes(
            {
              as: () => ({ loadRemoteModule, load: loadRemoteModule }),
              initRemoteEntry: async () => {
                throw new Error('Remote should not be initialized on the home page');
              },
            },
            {},
          ),
        ),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to Client Portal');
    expect(compiled.querySelector('main a[href="/dashboard"]')).toBeTruthy();
    expect(compiled.querySelector('main a[href="/reports"]')).toBeTruthy();
    expect(remoteLoads).toBe(0);

    await TestBed.inject(Router).navigateByUrl('/no-such-page');
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/');
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to Client Portal');
    expect(remoteLoads).toBe(0);
  });
});

describe('shell remote failure', () => {
  it('registers a remote lazily, shows the fallback while it is down and loads it once it is back', async () => {
    // Loading a remote fails until initRemoteEntry has registered it, and
    // registering an unreachable remote resolves without registering it.
    let remoteUp = false;
    let registered = false;
    const initRemoteEntry = jest.fn(async () => {
      registered = remoteUp;
    });
    const loadRemoteModule = async () => {
      if (!registered) {
        throw new Error("Remote 'dashboard' is not initialized.");
      }
      return { REMOTE_ROUTES: [{ path: '', component: DashboardStub }] as Routes };
    };
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(
          appRoutes(
            { as: () => ({ loadRemoteModule, load: loadRemoteModule }), initRemoteEntry } as never,
            { dashboard: 'http://remote.test/remoteEntry.json' },
          ),
          withNavigationErrorHandler(redirectToRemoteUnavailable),
        ),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const compiled = fixture.nativeElement as HTMLElement;

    await router.navigateByUrl('/');
    await fixture.whenStable();
    expect(initRemoteEntry).not.toHaveBeenCalled();

    await router.navigateByUrl('/dashboard');
    await fixture.whenStable();
    expect(router.url).toBe('/remote-unavailable?from=%2Fdashboard');
    expect(compiled.querySelector('h1')?.textContent).toContain('Remote application unavailable');
    expect(initRemoteEntry).toHaveBeenCalledWith(
      'http://remote.test/remoteEntry.json',
      'dashboard',
    );

    remoteUp = true;
    compiled.querySelector<HTMLButtonElement>('main button')?.click();
    await fixture.whenStable();
    expect(router.url).toBe('/dashboard');
    expect(compiled.querySelector('h1')?.textContent).toContain('Dashboard feature');
  });
});
