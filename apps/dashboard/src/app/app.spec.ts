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

  it('redirects the root to the dashboard feature', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/dashboard');
    expect(compiled.querySelector('h1')?.textContent).toContain('Dashboard Remote');
    expect(compiled.textContent).toContain('1,284');
    expect(compiled.textContent).toContain('24,590');
    expect(compiled.textContent).toContain('99.9%');
  });
});
