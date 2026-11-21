import { Component, input } from '@angular/core';

/**
 * Page frame shared by the remote feature pages: eyebrow, heading and intro in a
 * header, an optional badge (`[pageBadge]`) and the page content below.
 */
@Component({
  selector: 'ui-page',
  template: `
    <section class="page" [attr.aria-labelledby]="headingId()">
      <header class="page__header">
        <div>
          <p class="page__eyebrow">{{ eyebrow() }}</p>
          <h1 class="page__title" [id]="headingId()">{{ heading() }}</h1>
          <p class="page__intro">{{ intro() }}</p>
        </div>
        <ng-content select="[pageBadge]" />
      </header>
      <ng-content />
    </section>
  `,
  styleUrl: './page.scss',
})
export class Page {
  readonly eyebrow = input.required<string>();
  readonly heading = input.required<string>();
  /** Id of the `h1`, used to label the page section. */
  readonly headingId = input.required<string>();
  readonly intro = input.required<string>();
}
