import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  template: `
    <section class="page" aria-labelledby="home-title">
      <p class="eyebrow">Native federation demo</p>
      <h1 id="home-title">Welcome to Client Portal</h1>
      <p class="intro">Explore how independently built applications come together in one portal.</p>

      <div class="features">
        <a class="feature" routerLink="/dashboard">
          <span class="feature-icon" aria-hidden="true">01</span>
          <h2>Dashboard <span aria-hidden="true">&rarr;</span></h2>
          <p>Explore a snapshot of platform metrics from the dashboard remote.</p>
        </a>
        <a class="feature" routerLink="/reports">
          <span class="feature-icon" aria-hidden="true">02</span>
          <h2>Reports <span aria-hidden="true">&rarr;</span></h2>
          <p>View sample reports provided by the reports remote.</p>
        </a>
      </div>
      <p class="note">The shell loads each remote when you open its feature.</p>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .page {
      max-width: 1120px;
      margin: 0 auto;
      padding: 64px 24px;
      box-sizing: border-box;
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
    .feature p,
    .note {
      color: #64748b;
      line-height: 1.6;
    }
    .intro {
      max-width: 600px;
      margin: 12px 0 0;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-top: 40px;
    }
    .feature {
      display: block;
      padding: 24px;
      border: 1px solid #e5eaf2;
      border-radius: 16px;
      color: inherit;
      text-decoration: none;
      box-shadow: 0 8px 24px rgba(28, 44, 75, 0.04);
    }
    .feature:hover {
      border-color: #9daaf0;
    }
    .feature:focus-visible {
      outline: 2px solid #596bd0;
      outline-offset: 3px;
    }
    .feature-icon {
      display: inline-block;
      padding: 8px 10px;
      border-radius: 8px;
      background: #eef2ff;
      color: #5869c6;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .feature h2 {
      display: flex;
      justify-content: space-between;
      margin: 20px 0 0;
      font-size: 1.1rem;
    }
    .feature h2 span {
      color: #5869c6;
    }
    .feature p,
    .note {
      margin: 8px 0 0;
      font-size: 0.875rem;
    }
    .note {
      margin-top: 24px;
    }
    @media (max-width: 700px) {
      .page {
        padding: 40px 16px;
      }
      .features {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class HomePage {}
