import { Component } from '@angular/core';
import { DEMO_BRAND } from '@client-portal/shared/demo-contracts';

@Component({
  selector: 'app-remote-reports-page',
  template: `
    <section class="reports-page" aria-labelledby="reports-title">
      <header class="reports-page__header">
        <div>
          <p class="reports-page__eyebrow">{{ brand }} / Reports</p>
          <h1 id="reports-title" class="reports-page__title">Reports Remote</h1>
          <p class="reports-page__intro">
            Your reports in one place, delivered by an independent federated module.
          </p>
        </div>
        <span class="demo-badge"><span class="demo-badge__dot"></span> Demo data</span>
      </header>

      <div class="section-heading">
        <div>
          <h2 class="section-heading__title">Recent reports</h2>
          <p class="section-heading__description">
            A snapshot of your latest reports and their status.
          </p>
        </div>
        <span class="section-heading__count">3 reports</span>
      </div>

      <div class="reports-table">
        <table class="reports-table__table">
          <thead>
            <tr>
              <th class="reports-table__heading" scope="col">Report</th>
              <th class="reports-table__heading" scope="col">Status</th>
              <th class="reports-table__heading" scope="col">Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="reports-table__cell">
                <span class="reports-table__report-name"
                  ><span class="reports-table__report-icon" aria-hidden="true">&#9636;</span>
                  Monthly overview</span
                >
              </td>
              <td class="reports-table__cell">
                <span class="status-badge status-badge--ready">Ready</span>
              </td>
              <td class="reports-table__cell">Today</td>
            </tr>
            <tr>
              <td class="reports-table__cell">
                <span class="reports-table__report-name"
                  ><span class="reports-table__report-icon" aria-hidden="true">&#9636;</span>
                  Performance report</span
                >
              </td>
              <td class="reports-table__cell">
                <span class="status-badge status-badge--processing">Processing</span>
              </td>
              <td class="reports-table__cell">Today</td>
            </tr>
            <tr>
              <td class="reports-table__cell">
                <span class="reports-table__report-name"
                  ><span class="reports-table__report-icon" aria-hidden="true">&#9636;</span> Annual
                  summary</span
                >
              </td>
              <td class="reports-table__cell">
                <span class="status-badge status-badge--ready">Ready</span>
              </td>
              <td class="reports-table__cell">Yesterday</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="reports-page__footnote">Sample reports shown for the module federation demo.</p>
    </section>
  `,
  styleUrl: './reports-page.scss',
})
export class ReportsPage {
  protected readonly brand = DEMO_BRAND;
}
