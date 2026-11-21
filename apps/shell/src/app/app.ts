import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { REMOTES } from './remotes';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'shl-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly remotes = REMOTES;
}
