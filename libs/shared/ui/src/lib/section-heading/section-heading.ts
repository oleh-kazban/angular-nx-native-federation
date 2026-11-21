import { Component, input } from '@angular/core';

/** Section heading and description, with optional projected content on the right. */
@Component({
  selector: 'ui-section-heading',
  template: `
    <div class="section-heading">
      <div>
        <h2 class="section-heading__title">{{ heading() }}</h2>
        <p class="section-heading__description">{{ description() }}</p>
      </div>
      <ng-content />
    </div>
  `,
  styleUrl: './section-heading.scss',
})
export class SectionHeading {
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
}
