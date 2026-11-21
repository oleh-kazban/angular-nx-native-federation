import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { REMOTES } from './remotes';

@Component({
  selector: 'shl-home-page',
  imports: [RouterLink],
  template: `
    <section class="home-page" aria-labelledby="home-title">
      <p class="home-page__eyebrow">Native federation demo</p>
      <h1 id="home-title" class="home-page__title">Welcome to Client Portal</h1>
      <p class="home-page__intro">
        Explore how independently built applications come together in one portal.
      </p>

      <div class="home-page__features">
        @for (card of cards; track card.name) {
          <a class="feature-card" [routerLink]="'/' + card.name">
            <span class="feature-card__number" aria-hidden="true">{{ card.number }}</span>
            <h2 class="feature-card__title">
              {{ card.label }} <span class="feature-card__arrow" aria-hidden="true">&rarr;</span>
            </h2>
            <p class="feature-card__description">{{ card.description }}</p>
          </a>
        }
      </div>
      <p class="home-page__note">The shell loads each remote when you open its feature.</p>
    </section>
  `,
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly cards = REMOTES.map((remote, index) => ({
    ...remote,
    number: String(index + 1).padStart(2, '0'),
  }));
}
