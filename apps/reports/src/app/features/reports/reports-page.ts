import { Component } from '@angular/core';
import { DEMO_BRAND } from '@client-portal/shared/demo-contracts';

@Component({
  selector: 'app-remote-reports-page',
  standalone: true,
  template: `
    <section class="page" aria-labelledby="reports-title">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ brand }} / Reports</p>
          <h1 id="reports-title">Reports Remote</h1>
          <p class="intro">
            Your reports in one place, delivered by an independent federated module.
          </p>
        </div>
        <span class="badge"><span class="status-dot"></span> Demo data</span>
      </header>

      <div class="section-heading">
        <div>
          <h2>Recent reports</h2>
          <p>A snapshot of your latest reports and their status.</p>
        </div>
        <span class="report-count">3 reports</span>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th scope="col">Report</th>
              <th scope="col">Status</th>
              <th scope="col">Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span class="report-name"
                  ><span class="report-icon" aria-hidden="true">&#9636;</span> Monthly
                  overview</span
                >
              </td>
              <td><span class="status ready">Ready</span></td>
              <td>Today</td>
            </tr>
            <tr>
              <td>
                <span class="report-name"
                  ><span class="report-icon" aria-hidden="true">&#9636;</span> Performance
                  report</span
                >
              </td>
              <td><span class="status processing">Processing</span></td>
              <td>Today</td>
            </tr>
            <tr>
              <td>
                <span class="report-name"
                  ><span class="report-icon" aria-hidden="true">&#9636;</span> Annual summary</span
                >
              </td>
              <td><span class="status ready">Ready</span></td>
              <td>Yesterday</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="footnote">Sample reports shown for the module federation demo.</p>
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
    .footnote {
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin: 36px 0 20px;
    }
    .section-heading h2 {
      margin: 0;
      font-size: 1.05rem;
    }
    .section-heading p {
      margin: 5px 0 0;
      font-size: 0.875rem;
    }
    .report-count {
      color: #64748b;
      font-size: 0.8rem;
      white-space: nowrap;
    }
    .table-container {
      overflow-x: auto;
      border: 1px solid #e5eaf2;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(28, 44, 75, 0.04);
    }
    table {
      width: 100%;
      min-width: 520px;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      padding: 16px 24px;
      background: #f8fafc;
      color: #64748b;
      font-size: 0.7rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    td {
      padding: 20px 24px;
      border-top: 1px solid #edf1f6;
      color: #64748b;
      font-size: 0.875rem;
    }
    .report-name {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: #17233b;
      font-weight: 600;
    }
    .report-icon {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #eef2ff;
      color: #5869c6;
      font-size: 1.1rem;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .ready {
      background: #e8f7f0;
      color: #087c56;
    }
    .processing {
      background: #fff5df;
      color: #936000;
    }
    .footnote {
      margin: 16px 0 0;
      font-size: 0.8rem;
    }
    @media (max-width: 700px) {
      .page {
        padding: 32px 16px 48px;
      }
      .page-header {
        flex-direction: column;
      }
    }
  `,
})
export class ReportsPage {
  protected readonly brand = DEMO_BRAND;
}
