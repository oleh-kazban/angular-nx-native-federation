import { Component } from '@angular/core';
import { DEMO_BRAND } from '@client-portal/shared/demo-contracts';

@Component({
  selector: 'remote-reports-page',
  standalone: true,
  template: `
    <section>
      <h1>Reports Remote</h1>

      <p>This application is loaded independently.</p>

      <p>Platform: {{ brand }}</p>

      <table>
        <thead>
          <tr>
            <th>Report</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Monthly overview</td>
            <td>Ready</td>
            <td>Today</td>
          </tr>

          <tr>
            <td>Performance report</td>
            <td>Processing</td>
            <td>Today</td>
          </tr>

          <tr>
            <td>Annual summary</td>
            <td>Ready</td>
            <td>Yesterday</td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
})
export class ReportsPage {
  protected readonly brand = DEMO_BRAND;
}
