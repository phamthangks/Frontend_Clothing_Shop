import { Component } from '@angular/core';

import { UseraccessComponent } from '../useraccess/useraccess.component';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, UseraccessComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(public router: Router) {}

  activeRoute(route: string): boolean {
    return this.router.url === route;
  }
}
