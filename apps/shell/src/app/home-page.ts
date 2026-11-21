import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  template: `
    <section class="home-page" aria-labelledby="home-title">
      <p class="home-page__eyebrow">Native federation demo</p>
      <h1 id="home-title" class="home-page__title">Welcome to Client Portal</h1>
      <p class="home-page__intro">
        Explore how independently built applications come together in one portal.
      </p>

      <div class="home-page__features">
        <a class="feature-card" routerLink="/dashboard">
          <span class="feature-card__number" aria-hidden="true">01</span>
          <h2 class="feature-card__title">
            Dashboard <span class="feature-card__arrow" aria-hidden="true">&rarr;</span>
          </h2>
          <p class="feature-card__description">
            Explore a snapshot of platform metrics from the dashboard remote.
          </p>
        </a>
        <a class="feature-card" routerLink="/reports">
          <span class="feature-card__number" aria-hidden="true">02</span>
          <h2 class="feature-card__title">
            Reports <span class="feature-card__arrow" aria-hidden="true">&rarr;</span>
          </h2>
          <p class="feature-card__description">
            View sample reports provided by the reports remote.
          </p>
        </a>
      </div>
      <p class="home-page__note">The shell loads each remote when you open its feature.</p>
    </section>
  `,
  styleUrl: './home-page.scss',
})
export class HomePage {}
