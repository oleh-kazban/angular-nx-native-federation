import { Component } from '@angular/core';

@Component({
  selector: 'app-remote-unavailable',
  standalone: true,
  template: `
    <section>
      <h2>Remote application unavailable</h2>
      <p>The requested application could not be loaded.</p>
      <p>Please try again later.</p>
    </section>
  `,
})
export class RemoteUnavailableComponent {}
