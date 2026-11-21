import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DemoBadge } from '../demo-badge/demo-badge';
import { SectionHeading } from '../section-heading/section-heading';
import { Page } from './page';

@Component({
  imports: [Page, SectionHeading, DemoBadge],
  template: `
    <lib-page
      eyebrow="Brand / Area"
      heading="Area Remote"
      headingId="area-title"
      intro="Intro text"
    >
      <lib-demo-badge pageBadge />
      <lib-section-heading heading="Overview" description="Details">
        <span class="extra">3 items</span>
      </lib-section-heading>
      <p class="body">Page body</p>
    </lib-page>
  `,
})
class Host {}

describe('Page', () => {
  it('renders the header, labels the section by its heading and projects badge and content', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const section = el.querySelector('section');
    const h1 = el.querySelector('h1');
    expect(h1?.textContent).toBe('Area Remote');
    expect(h1?.id).toBe('area-title');
    expect(section?.getAttribute('aria-labelledby')).toBe('area-title');
    expect(el.querySelector('.page__eyebrow')?.textContent).toBe('Brand / Area');
    expect(el.querySelector('.page__intro')?.textContent).toBe('Intro text');
    expect(el.querySelector('.page__header lib-demo-badge')?.textContent).toContain('Demo data');
    expect(el.querySelector('section > .body')?.textContent).toBe('Page body');
    // The heading must not leak into a native `title` tooltip.
    expect(el.querySelector('lib-page')?.hasAttribute('title')).toBe(false);
  });
});

describe('SectionHeading', () => {
  it('renders heading and description and projects extra content', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const heading = (fixture.nativeElement as HTMLElement).querySelector('lib-section-heading');

    expect(heading?.querySelector('h2')?.textContent).toBe('Overview');
    expect(heading?.querySelector('.section-heading__description')?.textContent).toBe('Details');
    expect(heading?.querySelector('.section-heading > .extra')?.textContent).toBe('3 items');
  });
});
