import { Component } from '@angular/core';
import { DEMO_BRAND } from '@client-portal/shared/demo-contracts';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  template: `
    <section class="page" aria-labelledby="dashboard-title">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ brand }} / Dashboard</p>
          <h1 id="dashboard-title">Dashboard Remote</h1>
          <p class="intro">A quick look at your platform, delivered by a federated module.</p>
        </div>
        <span class="badge"><span class="status-dot"></span> Demo data</span>
      </header>

      <div class="section-heading">
        <div>
          <h2>Platform overview</h2>
          <p>A snapshot of your key metrics.</p>
        </div>
      </div>

      <div class="metrics">
        <article class="metric">
          <div class="metric-label">
            <span>Active users</span><span class="metric-icon">01</span>
          </div>
          <strong>1,284</strong>
          <p>Users on the platform</p>
        </article>
        <article class="metric">
          <div class="metric-label"><span>Requests</span><span class="metric-icon">02</span></div>
          <strong>24,590</strong>
          <p>Requests processed</p>
        </article>
        <article class="metric">
          <div class="metric-label">
            <span>Availability</span><span class="metric-icon">03</span>
          </div>
          <strong>99.9%</strong>
          <p>Platform uptime</p>
        </article>
      </div>

      <aside class="federation-note">
        <span class="note-icon" aria-hidden="true">&#10022;</span>
        <div>
          <h2>Independently built. Seamlessly connected.</h2>
          <p>This dashboard is a remote feature that can be loaded dynamically by the shell.</p>
        </div>
      </aside>
    </section>
  `,
  styles: `
    :host {
      display: block;
      color: #17233b;
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    }
    .page {
      max-width: 1120px;
      margin: 0 auto;
      padding: 48px 24px 64px;
      box-sizing: border-box;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding-bottom: 36px;
      border-bottom: 1px solid #e5eaf2;
    }
    .eyebrow {
      margin: 0 0 12px;
      color: #5369b2;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: clamp(2rem, 5vw, 2.75rem);
      letter-spacing: -0.04em;
    }
    .intro,
    .section-heading p,
    .metric p,
    .federation-note p {
      color: #64748b;
      line-height: 1.6;
    }
    .intro {
      margin: 10px 0 0;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      padding: 8px 12px;
      border: 1px solid #dce5f0;
      border-radius: 999px;
      background: #f8fafc;
      color: #52647a;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #14a87a;
    }
    .section-heading {
      margin: 36px 0 20px;
    }
    .section-heading h2,
    .federation-note h2 {
      margin: 0;
      font-size: 1.05rem;
    }
    .section-heading p {
      margin: 5px 0 0;
      font-size: 0.875rem;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }
    .metric {
      padding: 24px;
      border: 1px solid #e5eaf2;
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 8px 24px rgba(28, 44, 75, 0.04);
    }
    .metric-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #52647a;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .metric-icon {
      padding: 7px 9px;
      border-radius: 8px;
      background: #eef2ff;
      color: #5869c6;
      font-size: 0.7rem;
    }
    .metric strong {
      display: block;
      margin-top: 24px;
      font-size: 2rem;
      letter-spacing: -0.04em;
    }
    .metric p {
      margin: 6px 0 0;
      font-size: 0.8rem;
    }
    .federation-note {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-top: 24px;
      padding: 24px;
      border-radius: 16px;
      background: #f1f5ff;
    }
    .note-icon {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      border-radius: 12px;
      background: #dfe7ff;
      color: #5165c3;
      font-size: 1.25rem;
    }
    .federation-note p {
      margin: 6px 0 0;
      font-size: 0.875rem;
    }
    @media (max-width: 700px) {
      .page {
        padding: 32px 16px 48px;
      }
      .page-header {
        flex-direction: column;
      }
      .metrics {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class DashboardPage {
  protected readonly brand = DEMO_BRAND;
}
