import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { appRoutes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();
  });

  it('navigates from the welcome page to the dashboard feature', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome dashboard');

    const link = compiled.querySelector<HTMLAnchorElement>('a[href="/dashboard"]');
    expect(link).toBeTruthy();
    link?.click();
    await fixture.whenStable();
    expect(compiled.querySelector('h1')?.textContent).toContain('Dashboard Remote');
    expect(compiled.textContent).toContain('1,284');
    expect(compiled.textContent).toContain('24,590');
    expect(compiled.textContent).toContain('99.9%');
  });
});
