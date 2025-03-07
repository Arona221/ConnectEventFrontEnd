import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuService } from './core/service/MenuService';
import { MenuComponent } from './menu/menu.component';
import { PiedDePageComponent } from './pied-de-page/pied-de-page.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuComponent, PiedDePageComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ConnectEventFrontEnd';
  isMenuVisible = true; // Variable pour afficher ou cacher le menu

  constructor(private router: Router, private menuService: MenuService) {
    this.menuService.isMenuVisible$.subscribe((isVisible) => {
      this.isMenuVisible = isVisible;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const hideMenuRoutes = ['/acceuilEquipe-marketing', '/mes-campagnes', '/campagnes-create','/evenements-promouvoir']; 
        const urlWithoutParams = event.url.split('?')[0]; // Supprime les paramètres
        this.isMenuVisible = !hideMenuRoutes.includes(urlWithoutParams);
      });
      
  }
}
