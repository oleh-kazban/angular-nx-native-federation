import { Component } from '@angular/core';
import { DemoBadge, Page, SectionHeading } from '@client-portal/shared/ui';
import { DEMO_BRAND } from '@client-portal/shared/demo-contracts';

@Component({
  imports: [Page, SectionHeading, DemoBadge],
  selector: 'rpt-reports-page',
  template: `
    <ui-page
      class="reports-page"
      [eyebrow]="brand + ' / Reports'"
      heading="Reports Remote"
      headingId="reports-title"
      intro="Your reports in one place, delivered by an independent federated module."
    >
      <ui-demo-badge pageBadge />

      <ui-section-heading
        heading="Recent reports"
        description="A snapshot of your latest reports and their status."
      >
        <span class="reports-count">3 reports</span>
      </ui-section-heading>

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
    </ui-page>
  `,
  styleUrl: './reports-page.scss',
})
export class ReportsPage {
  protected readonly brand = DEMO_BRAND;
}
