import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { appRoutes } from './app.routes';
import { HomePage } from './home-page';

@Component({ template: '<h1>Dashboard feature</h1>' })
class DashboardStub {}

@Component({ template: '<h1>Reports feature</h1>' })
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
  it('renders the home page without loading a remote', async () => {
    let remoteLoads = 0;
    const loadRemoteModule = async () => {
      remoteLoads++;
      throw new Error('Remote should not be loaded on the home page');
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(appRoutes({ as: () => ({ loadRemoteModule, load: loadRemoteModule }) })),
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
  });
});
