import { Component } from '@angular/core';
import { DEMO_BRAND } from '@client-portal/shared/demo-contracts';

@Component({
  selector: 'app-dashboard-page',
  template: `
    <section class="dashboard-page" aria-labelledby="dashboard-title">
      <header class="dashboard-page__header">
        <div>
          <p class="dashboard-page__eyebrow">{{ brand }} / Dashboard</p>
          <h1 id="dashboard-title" class="dashboard-page__title">Dashboard Remote</h1>
          <p class="dashboard-page__intro">
            A quick look at your platform, delivered by a federated module.
          </p>
        </div>
        <span class="demo-badge"><span class="demo-badge__dot"></span> Demo data</span>
      </header>

      <div class="section-heading">
        <div>
          <h2 class="section-heading__title">Platform overview</h2>
          <p class="section-heading__description">A snapshot of your key metrics.</p>
        </div>
      </div>

      <div class="dashboard-page__metrics">
        <article class="metric-card">
          <div class="metric-card__header">
            <span>Active users</span><span class="metric-card__number">01</span>
          </div>
          <strong class="metric-card__value">1,284</strong>
          <p class="metric-card__description">Users on the platform</p>
        </article>
        <article class="metric-card">
          <div class="metric-card__header">
            <span>Requests</span><span class="metric-card__number">02</span>
          </div>
          <strong class="metric-card__value">24,590</strong>
          <p class="metric-card__description">Requests processed</p>
        </article>
        <article class="metric-card">
          <div class="metric-card__header">
            <span>Availability</span><span class="metric-card__number">03</span>
          </div>
          <strong class="metric-card__value">99.9%</strong>
          <p class="metric-card__description">Platform uptime</p>
        </article>
      </div>

      <aside class="federation-note">
        <span class="federation-note__icon" aria-hidden="true">&#10022;</span>
        <div>
          <h2 class="federation-note__title">Independently built. Seamlessly connected.</h2>
          <p class="federation-note__text">
            This dashboard is a remote feature that can be loaded dynamically by the shell.
          </p>
        </div>
      </aside>
    </section>
  `,
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  protected readonly brand = DEMO_BRAND;
}
