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

  it('redirects the root to the reports feature', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/reports');
    expect(compiled.querySelector('h1')?.textContent).toContain('Reports Remote');
    expect(compiled.textContent).toContain('Monthly overview');
    expect(compiled.textContent).toContain('Performance report');
    expect(compiled.textContent).toContain('Annual summary');
  });
});
