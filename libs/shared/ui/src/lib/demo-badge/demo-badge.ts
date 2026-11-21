import { Component } from '@angular/core';

/** "Demo data" pill shown on pages that render sample content. */
@Component({
  selector: 'lib-demo-badge',
  template: `<span class="demo-badge"><span class="demo-badge__dot"></span> Demo data</span>`,
  styleUrl: './demo-badge.scss',
})
export class DemoBadge {}
