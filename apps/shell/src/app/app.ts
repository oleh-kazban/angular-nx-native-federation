import { afterNextRender, Component, ElementRef, inject, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';

import { REMOTES } from './remotes';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'shl-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly remotes = REMOTES;

  constructor() {
    // After each in-app navigation (not the initial load), move focus to the new
    // page's h1 so keyboard and screen reader users land on, and hear, the new page.
    // Done here because remote pages render their own h1 and know nothing about routing.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const injector = inject(Injector);
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() =>
        afterNextRender(
          () => {
            const heading = host.querySelector<HTMLElement>('main h1');
            if (heading) {
              heading.tabIndex = -1;
              heading.focus();
            }
          },
          { injector },
        ),
      );
  }
}
