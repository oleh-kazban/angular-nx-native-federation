import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'shl-remote-unavailable',
  imports: [RouterLink],
  template: `
    <section class="remote-unavailable" aria-labelledby="remote-unavailable-title">
      <h1 id="remote-unavailable-title" class="remote-unavailable__title">
        Remote application unavailable
      </h1>
      <p class="remote-unavailable__message">
        The requested application could not be loaded. It may be temporarily offline.
      </p>
      <div class="remote-unavailable__actions">
        @if (retryUrl) {
          <button type="button" class="remote-unavailable__retry-button" (click)="retry()">
            Try again
          </button>
        }
        <a class="remote-unavailable__home-link" routerLink="/">Back to home</a>
      </div>
    </section>
  `,
  styleUrl: './remote-unavailable.scss',
})
export class RemoteUnavailablePage {
  private readonly router = inject(Router);

  /** In-app URL whose navigation failed; only same-app absolute paths are accepted. */
  protected readonly retryUrl = this.parseRetryUrl(
    inject(ActivatedRoute).snapshot.queryParamMap.get('from'),
  );

  protected retry(): void {
    if (this.retryUrl) {
      void this.router.navigateByUrl(this.retryUrl);
    }
  }

  private parseRetryUrl(from: string | null): string | null {
    return from?.startsWith('/') && !from.startsWith('//') ? from : null;
  }
}
