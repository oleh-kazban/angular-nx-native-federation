import { Component } from '@angular/core';
import { DEMO_BRAND } from '@client-portal/shared/demo-contracts';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  template: `
    <section>
      <h1>Dashboard Remote</h1>

      <p>Loaded dynamically by the Shell.</p>

      <p>Platform: {{ brand }}</p>

      <div class="dashboard-grid">
        <article>
          <h2>Active users</h2>
          <strong>1,284</strong>
        </article>

        <article>
          <h2>Requests</h2>
          <strong>24,590</strong>
        </article>

        <article>
          <h2>Availability</h2>
          <strong>99.9%</strong>
        </article>
      </div>
    </section>
  `,
})
export class DashboardPage {
  protected readonly brand = DEMO_BRAND;
}
